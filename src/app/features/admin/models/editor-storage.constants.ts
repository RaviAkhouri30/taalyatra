/** Where the editor keeps its publish history (admin-only in `firestore.rules`). */
export const PUBLISHES_COLLECTION = 'publishes';

/** How many publishes the history keeps; older ones are removed when a new one is made. */
export const PUBLISH_HISTORY_LIMIT = 20;

/** When the last backup was made (admin-only in `firestore.rules`, 0016 V13), so every device agrees. */
export const BACKUPS_STATE_PATH = 'adminState/backups';

/** Where this browser keeps its copy of the latest backup. */
export const BROWSER_BACKUP_KEY = 'taal-yatra.admin.backup';

/**
 * The largest backup kept in this browser, in characters. Browsers allow about 5 MB per site;
 * this leaves room for the editor's other notes. Today's content is about 0.2 MB.
 */
export const BROWSER_BACKUP_MAX_CHARS = 4_000_000;
