/** How a pre-publish finding affects publishing. */
export enum IssueSeverity {
  /** Must be fixed: publishing is blocked. */
  Error = 'error',
  /** Worth a look: the owner may publish anyway. */
  Warning = 'warning',
}
