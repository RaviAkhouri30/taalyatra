import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ContentPath } from './content-path.enum';

/** The backup format this editor writes and reads; a newer one is refused (0016 V13). */
export const BACKUP_FORMAT = 1;

/** Marks a file as this site's backup. */
export const BACKUP_SITE = 'taal-yatra';

/** A backup file's media type. */
export const BACKUP_MEDIA_TYPE = 'application/json';

/** A backup: the site's content and the photo library's entries, by document path. */
export interface IBackup {
  readonly format: number;
  readonly site: string;
  /** The release that made it, e.g. "1.12.0". */
  readonly version: string;
  /** When it was made (ISO 8601). */
  readonly createdAt: string;
  readonly documents: Readonly<Record<string, DocumentFields>>;
}

/** Why a file can't be restored, in the owner's words. */
export const BACKUP_PROBLEMS = {
  unreadable: 'This file can’t be read as a backup. Choose a file named taal-yatra-backup-….json.',
  notOurs: 'This file isn’t a Taal Yatra backup.',
  newer: 'This backup was made by a newer version of the editor. Reload the page and try again.',
  damaged: 'This backup is damaged, so nothing was restored.',
} as const;

/** The result of checking a file: a backup, or why it isn't one. */
export type BackupCheck = { readonly backup: IBackup } | { readonly problem: string };

const CONTENT_PATHS = new Set<string>(Object.values(ContentPath));
/** A library entry (`media/{id}`), with the id as `firestore.rules` accepts it. */
const MEDIA_PATH = /^media\/[0-9a-f-]{36}$/;
/** A lead (`proposals/{id}`), in a backup made with "Include leads" (0018 D6). */
const LEAD_PATH = /^proposals\/[A-Za-z0-9]{1,40}$/;
/** `YYYY-MM-DD`, the start of an ISO 8601 moment. */
const DAY_LENGTH = 'YYYY-MM-DD'.length;

/** @returns Whether this is content the editor drafts and publishes. */
export function isContentPath(path: string): boolean {
  return CONTENT_PATHS.has(path);
}

/** @returns Whether a backup may hold this path: content, a library entry, or a lead. */
export function isBackupPath(path: string): boolean {
  return isContentPath(path) || MEDIA_PATH.test(path) || LEAD_PATH.test(path);
}

/**
 * @param createdAt When the backup was made (ISO 8601).
 * @returns Its file name, e.g. `taal-yatra-backup-2026-11-18.json`.
 */
export function backupFileName(createdAt: string): string {
  return `${BACKUP_SITE}-backup-${createdAt.slice(0, DAY_LENGTH)}.json`;
}

function isFields(value: unknown): value is DocumentFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkDocuments(value: unknown): Record<string, DocumentFields> | null {
  if (!isFields(value)) {
    return null;
  }
  const entries = Object.entries(value);
  const valid = entries.every(([path, fields]) => isBackupPath(path) && isFields(fields));
  return valid ? (value as Record<string, DocumentFields>) : null;
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Checks everything before anything is restored: a damaged or foreign file changes nothing.
 * @param text A file's text.
 * @returns The backup, or why it can't be restored.
 */
export function checkBackup(text: string): BackupCheck {
  const data = parse(text);
  if (!isFields(data)) {
    return { problem: BACKUP_PROBLEMS.unreadable };
  }
  const fields = new Map(Object.entries(data));
  const format = fields.get('format');
  if (fields.get('site') !== BACKUP_SITE || typeof format !== 'number') {
    return { problem: BACKUP_PROBLEMS.notOurs };
  }
  if (format > BACKUP_FORMAT) {
    return { problem: BACKUP_PROBLEMS.newer };
  }
  const documents = checkDocuments(fields.get('documents'));
  const createdAt = fields.get('createdAt');
  const version = fields.get('version');
  if (documents === null || typeof createdAt !== 'string' || typeof version !== 'string') {
    return { problem: BACKUP_PROBLEMS.damaged };
  }
  return { backup: { format, site: BACKUP_SITE, version, createdAt, documents } };
}
