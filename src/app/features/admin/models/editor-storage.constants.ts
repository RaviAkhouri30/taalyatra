/** Where the editor keeps unpublished documents (admin-only in `firestore.rules`). */
export const DRAFTS_COLLECTION = 'drafts';

/** Where the editor keeps its publish history (admin-only in `firestore.rules`). */
export const PUBLISHES_COLLECTION = 'publishes';

/** How many publishes the history keeps; older ones are removed when a new one is made. */
export const PUBLISH_HISTORY_LIMIT = 20;

/**
 * @param path A document path, e.g. `home/hero`.
 * @returns Its draft's id, e.g. `home__hero` (a Firestore id can't contain `/`).
 */
export function draftId(path: string): string {
  return path.split('/').join('__');
}
