/** Why an AI request failed, independent of the provider (0025). */
export enum AiErrorKind {
  /** Not set up, the provider failed, or the network did; trying later may work. */
  Unavailable = 'unavailable',
  /** The account's allowance for today is used up (D4). */
  Limit = 'limit',
  /** Signed out, expired, or not allowed this help. */
  Refused = 'refused',
}
