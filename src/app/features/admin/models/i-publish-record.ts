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
  /** Who published it (0019); records from before 2.0.0 have none: the owner. */
  readonly by?: string;
  /** Their email, for the history. */
  readonly byEmail?: string;
  /** For an approved change, the email of the manager who sent it. */
  readonly approvedFrom?: string;
  /** For a change its manager approved themselves (0023): their title and note, each may be empty. */
  readonly selfApproval?: ISelfApproval;
}

/** A manager's own approval of their changes (0023). */
export interface ISelfApproval {
  readonly title: string;
  readonly note: string;
}

/** Where a manager's self-approval marker is kept; the rules check it with the commit (0023 D5). */
export const SELF_APPROVALS_COLLECTION = 'selfApprovals';
