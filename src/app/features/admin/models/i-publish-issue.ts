import { type IssueSeverity } from './issue-severity.enum';

/** One pre-publish finding, located for the owner by section and field. */
export interface IPublishIssue {
  readonly severity: IssueSeverity;
  /** The editor card, e.g. "Hero". */
  readonly section: string;
  /** The field, e.g. "Offer card 2 · Card title". */
  readonly field: string;
  /** What to do about it. */
  readonly message: string;
}
