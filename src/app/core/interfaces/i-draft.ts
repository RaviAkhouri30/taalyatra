import { type DocumentFields } from './i-document-store';

/**
 * Where unpublished documents live (admin-only in `firestore.rules`). The editor writes them;
 * preview mode reads them. One stored draft per changed document (ADR-0013).
 */
export const DRAFTS_COLLECTION = 'drafts';

/** An unpublished version of one document (`drafts/{id}`). */
export interface IDraft {
  /** The live document it replaces, e.g. `home/hero`. */
  readonly path: string;
  /** The whole document as it will be published. */
  readonly content: DocumentFields;
  /** When it was last saved (ISO 8601). */
  readonly savedAt: string;
  /** The account that last saved it (0019); drafts from before 2.0.0 have none: the owner's. */
  readonly savedBy?: string;
}

/**
 * @param path A document path, e.g. `home/hero`.
 * @returns Its draft's id, e.g. `home__hero` (a Firestore id can't contain `/`).
 */
export function draftId(path: string): string {
  return path
    .split('/')
    .filter((segment) => segment.length > 0)
    .join('__');
}

function isFields(value: unknown): value is DocumentFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param fields A stored draft document.
 * @returns The draft, or `null` when the stored data isn't one (it is then ignored).
 */
export function toDraft(fields: DocumentFields | null): IDraft | null {
  const entries = new Map(Object.entries(fields ?? {}));
  const path = entries.get('path');
  const content = entries.get('content');
  const savedAt = entries.get('savedAt');
  const savedBy = entries.get('savedBy');
  if (typeof path !== 'string' || !isFields(content) || typeof savedAt !== 'string') {
    return null;
  }
  return typeof savedBy === 'string'
    ? { path, content, savedAt, savedBy }
    : { path, content, savedAt };
}

/**
 * @param stored Stored draft documents, by id.
 * @returns The valid drafts, by the path of the document each one changes.
 */
export function draftsByPath(
  stored: ReadonlyMap<string, DocumentFields>,
): ReadonlyMap<string, IDraft> {
  return new Map(
    [...stored.values()].flatMap((fields) => {
      const draft = toDraft(fields);
      return draft === null ? [] : [[draft.path, draft] as const];
    }),
  );
}
