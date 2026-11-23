import {
  type Observable,
  catchError,
  defer,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AI_UNAVAILABLE } from './ai-client.js';
import { FIRESTORE_DOCUMENTS_URL, HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies } from './api-handler.js';

/**
 * The home sections the chat may answer from (0025 V7): what visitors ask about. An allowlist, so a
 * new section isn't told until it's chosen; the time-limited offer is left out, so an ended one is
 * never quoted.
 */
export const CHAT_SECTIONS: ReadonlySet<string> = new Set([
  'hero',
  'audiences',
  'experiences',
  'shows',
  'drumCircle',
  'how',
  'cities',
  'philosophy',
  'faq',
  'contact',
]);

/** From `site/config`: the business's name and how to reach it. */
const CONFIG_PARTS = ['brand', 'contact'];

/** Fields that hold addresses, ids or layout, not words a visitor would ask about. */
const SKIPPED_KEYS: ReadonlySet<string> = new Set([
  'src',
  'alt',
  'url',
  'href',
  'link',
  'image',
  'icon',
  'id',
  'anchor',
  'order',
  'avatarUrl',
]);

/** The longest text sent as the site's information. */
export const CONTENT_MAX = 12_000;
/** How long the published text is kept before reading it again: 15 minutes. */
export const CONTENT_TTL_MS = 900_000;
const PAGE_SIZE = 100;

function entries(value: unknown): ReadonlyMap<string, unknown> {
  return new Map(
    typeof value === 'object' && value !== null
      ? Object.entries(value as Record<string, unknown>)
      : [],
  );
}

/**
 * @param value A Firestore REST value.
 * @param key Its field's name.
 * @returns Its words: strings that aren't addresses, from maps and lists too, leaving out a map
 *   the owner hid (`hidden: true`, 2.15.0).
 */
export function wordsOf(value: unknown, key = ''): string[] {
  const parts = entries(value);
  const text = parts.get('stringValue');
  if (typeof text === 'string') {
    const isAddress = text.startsWith('http') || text.startsWith('/');
    return SKIPPED_KEYS.has(key) || isAddress || !text.trim() ? [] : [text.trim()];
  }
  if (parts.has('mapValue')) {
    const fields = entries(entries(parts.get('mapValue')).get('fields'));
    // An item the owner hid (2.15.0), a FAQ question or a show: the chat never answers from it.
    if (entries(fields.get('hidden')).get('booleanValue') === true) {
      return [];
    }
    return [...fields].flatMap(([name, inner]) => wordsOf(inner, name));
  }
  const list = entries(parts.get('arrayValue')).get('values');
  return Array.isArray(list) ? list.flatMap((inner: unknown) => wordsOf(inner, key)) : [];
}

/** A REST document's id and fields. */
interface IRestDocument {
  readonly id: string;
  readonly fields: unknown;
}

function documentsOf(body: unknown): IRestDocument[] {
  const list = entries(body).get('documents');
  return (Array.isArray(list) ? (list as unknown[]) : []).map((document) => {
    const name = entries(document).get('name');
    return {
      id: typeof name === 'string' ? (name.split('/').at(-1) ?? '') : '',
      fields: entries(document).get('fields'),
    };
  });
}

/** @returns The home sections the owner hid on Visibility (0015). */
export function hiddenSections(visibility: unknown): ReadonlySet<string> {
  const sections = entries(
    entries(entries(entries(visibility).get('fields')).get('sections')).get('mapValue'),
  ).get('fields');
  return new Set(
    [...entries(sections)]
      .filter(([, value]) => entries(value).get('booleanValue') === false)
      .map(([section]) => section),
  );
}

/** The parts of the published site the chat reads, as REST bodies (`null` when unreadable). */
export interface ISiteDocuments {
  readonly home: unknown;
  readonly config: unknown;
  readonly visibility: unknown;
  readonly shows: unknown;
}

/**
 * @param site The published site.
 * @returns Its text for the chat: the chosen sections the owner shows, the show formats when Shows
 *   is shown, and the business's name and contact details; cut to `CONTENT_MAX`.
 */
export function siteText(site: ISiteDocuments): string {
  const hidden = hiddenSections(site.visibility);
  const sections = documentsOf(site.home)
    .filter((document) => CHAT_SECTIONS.has(document.id) && !hidden.has(document.id))
    .map(
      (document) =>
        `## ${document.id}\n${wordsOf({ mapValue: { fields: document.fields } }).join('\n')}`,
    );
  const shows = hidden.has('shows')
    ? []
    : documentsOf(site.shows).map((document) =>
        wordsOf({ mapValue: { fields: document.fields } }).join('\n'),
      );
  const config = entries(entries(site.config).get('fields'));
  const business = CONFIG_PARTS.flatMap((part) => wordsOf(config.get(part), part));
  return [
    ...sections,
    ...(shows.length > 0 ? [`## show formats\n${shows.join('\n')}`] : []),
    ...(business.length > 0 ? [`## business\n${business.join('\n')}`] : []),
  ]
    .join('\n\n')
    .slice(0, CONTENT_MAX);
}

/**
 * The published site's text, read with no credential (the rules let anyone read it) and kept for
 * `CONTENT_TTL_MS`, so a busy hour reads Firestore a few times, not once per question.
 */
export class SiteContent {
  private cached: { readonly text: string; readonly at: number } | null = null;

  /**
   * @param deps The clock and the network.
   * @returns Emits the text once.
   * @throws {ApiError} Through the stream: 503 when the home sections can't be read.
   */
  public text(deps: IApiDependencies): Observable<string> {
    const cached = this.cached;
    if (cached && deps.now() - cached.at < CONTENT_TTL_MS) {
      return of(cached.text);
    }
    // forkJoin: four independent reads of the published site.
    return forkJoin({
      home: readJson(`${FIRESTORE_DOCUMENTS_URL}/home?pageSize=${String(PAGE_SIZE)}`, deps),
      config: readJson(`${FIRESTORE_DOCUMENTS_URL}/site/config`, deps),
      visibility: readJson(`${FIRESTORE_DOCUMENTS_URL}/site/visibility`, deps),
      shows: readJson(`${FIRESTORE_DOCUMENTS_URL}/showFormats?pageSize=${String(PAGE_SIZE)}`, deps),
    }).pipe(
      switchMap((site) =>
        site.home === null
          ? throwError(() => new ApiError(HttpStatus.ServiceUnavailable, AI_UNAVAILABLE))
          : of(siteText(site)),
      ),
      tap((text) => {
        this.cached = { text, at: deps.now() };
      }),
    );
  }
}

/** @returns The URL's JSON, or `null` when it can't be read: the caller decides what that means. */
function readJson(url: string, deps: IApiDependencies): Observable<unknown> {
  // defer: the request is made when the stream is subscribed.
  return defer(() => deps.readPublic(url)).pipe(
    switchMap((response) =>
      response.ok ? defer(() => response.json() as Promise<unknown>) : of(null),
    ),
    catchError(() => of(null)),
    map((body) => body ?? null),
  );
}
