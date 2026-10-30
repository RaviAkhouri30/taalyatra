/** Where the editor keeps its publish history (admin-only in `firestore.rules`). */
export const PUBLISHES_COLLECTION = 'publishes';

/** How many publishes the history keeps; older ones are removed when a new one is made. */
export const PUBLISH_HISTORY_LIMIT = 20;
