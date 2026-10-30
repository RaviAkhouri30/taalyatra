import { type DocumentFields } from '@core/interfaces/i-document-store';

/** One publish in the history (`publishes/{id}`), enough to put the previous version back. */
export interface IPublishRecord {
  /** Sortable: newer publishes have greater ids. */
  readonly id: string;
  /** When it was published (ISO 8601). */
  readonly publishedAt: string;
  /** The documents it changed. */
  readonly changed: readonly string[];
  /** Each changed document as it was just before, or `null` when it didn't exist. */
  readonly before: Readonly<Record<string, DocumentFields | null>>;
}
