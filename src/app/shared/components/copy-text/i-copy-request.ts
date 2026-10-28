/** What to copy and what to tell the visitor afterwards. */
export interface ICopyRequest {
  readonly text: string;
  /** Toast after a successful copy. */
  readonly copied: string;
  /** Toast when copying fails. */
  readonly failed: string;
}
