import { type Observable, catchError, defer, map, of, switchMap, throwError } from 'rxjs';
import { INVALID_TOKEN, verifyToken } from './admin-token.js';
import {
  ADMIN_UID,
  FIRESTORE_DOCUMENTS_URL,
  HttpStatus,
  ROLES_COLLECTION,
} from './api-constants.js';
import { ApiError } from './api-error.js';
import { type IApiDependencies } from './api-handler.js';

/** What an account not on Team access is told. */
export const AI_NOT_ALLOWED = 'This account can’t use AI help.';

/** Who is asking for AI help (0025 D8). */
export interface IAiCaller {
  readonly uid: string;
  /** May analyse the leads: the owner, a running super manager, or a manager given Leads. */
  readonly leads: boolean;
}

function entries(value: unknown): ReadonlyMap<string, unknown> {
  return new Map(typeof value === 'object' && value !== null ? Object.entries(value) : []);
}

/** @returns A Firestore REST map field's own fields, e.g. a role's `areas`. */
function mapFields(
  fields: ReadonlyMap<string, unknown>,
  key: string,
): ReadonlyMap<string, unknown> {
  return entries(entries(entries(fields.get(key)).get('mapValue')).get('fields'));
}

/**
 * @param fields A role's REST fields.
 * @param now The current time in milliseconds.
 * @returns Whether it makes a running super manager (0024): for good, or before its end, as the
 *   rules judge it.
 */
function isRunningSuper(fields: ReadonlyMap<string, unknown>, now: number): boolean {
  if (!fields.has('superManager')) {
    return false;
  }
  const until = entries(mapFields(fields, 'superManager').get('untilMs'));
  if (until.has('nullValue')) {
    return true;
  }
  const untilMs = Number(until.get('integerValue'));
  return Number.isFinite(untilMs) && now < untilMs;
}

/**
 * @param document A Firestore REST role document.
 * @param now The current time in milliseconds.
 * @returns Whether it allows the leads: `areas.leads` explicitly on, or a running super manager.
 */
export function roleAllowsLeads(document: unknown, now: number): boolean {
  const fields = entries(entries(document).get('fields'));
  const leads = entries(mapFields(fields, 'areas').get('leads'));
  return leads.get('booleanValue') === true || isRunningSuper(fields, now);
}

function managerOf(uid: string, token: string, deps: IApiDependencies): Observable<IAiCaller> {
  const url = `${FIRESTORE_DOCUMENTS_URL}/${ROLES_COLLECTION}/${encodeURIComponent(uid)}`;
  // defer: the request is made when the stream is subscribed, not when it's built.
  return defer(() => deps.read(url, token)).pipe(
    catchError(() => throwError(() => new ApiError(HttpStatus.BadGateway, 'Please try again.'))),
    // switchMap: the body is read only for a record the rules let them see; none means not added.
    switchMap((response) =>
      response.ok
        ? defer(() => response.json() as Promise<unknown>)
        : throwError(() => new ApiError(HttpStatus.Forbidden, AI_NOT_ALLOWED)),
    ),
    map((document) => ({ uid, leads: roleAllowsLeads(document, deps.now()) })),
  );
}

/**
 * Checks who asks for AI help (0025 D8): the owner, or an account on Team access, read with the
 * caller's own token as uploads are (0019 decision 8), so this server holds no database credential.
 *
 * @param token The token from the request, if any.
 * @param deps Keys, clock and the network.
 * @returns Emits the caller once.
 * @throws {ApiError} Through the stream: 401 for a missing or invalid token, 403 for an account
 *   not on Team access, 502 when its role couldn't be read.
 */
export function aiCaller(token: string | null, deps: IApiDependencies): Observable<IAiCaller> {
  if (!token) {
    return throwError(() => new ApiError(HttpStatus.Unauthorized, INVALID_TOKEN));
  }
  return verifyToken(token, deps.keys, deps.now()).pipe(
    // switchMap: the owner needs no read; anyone else's role is read once per request.
    switchMap((uid) =>
      uid === ADMIN_UID ? of({ uid, leads: true }) : managerOf(uid, token, deps),
    ),
  );
}
