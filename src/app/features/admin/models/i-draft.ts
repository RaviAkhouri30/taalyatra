import { type DocumentFields } from '@core/interfaces/i-document-store';

/** An unpublished version of one document (`drafts/{key}`). */
export interface IDraft {
  /** The live document it replaces, e.g. `home/hero`. */
  readonly path: string;
  /** The whole document as it will be published. */
  readonly content: DocumentFields;
  /** When it was last saved (ISO 8601). */
  readonly savedAt: string;
}
