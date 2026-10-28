/** Why an authentication request failed, independent of the provider (ADR-0012). */
export enum AuthErrorKind {
  /** Wrong email or password. Deliberately vague: never reveals whether the email exists. */
  InvalidCredentials = 'invalid-credentials',
  /** The provider is rate-limiting this client. */
  TooManyAttempts = 'too-many-attempts',
  /** The provider couldn't be reached. */
  Network = 'network',
  /** Authentication isn't configured in this build. */
  Unavailable = 'unavailable',
  Unknown = 'unknown',
}
