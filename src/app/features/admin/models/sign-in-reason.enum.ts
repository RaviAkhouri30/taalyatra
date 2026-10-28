/** Why the sign-in page was opened, from its `reason` query parameter. */
export enum SignInReason {
  /** A signed-in account that isn't the admin was turned away by the guard. */
  NotAdmin = 'not-admin',
}
