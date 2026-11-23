/** Why a manager's account couldn't be made (0030). */
export enum AccountErrorKind {
  /** The email already has an account: its id is pasted instead. */
  EmailTaken = 'email-taken',
  /** The project doesn't let new accounts be made from the site. */
  NotAllowed = 'not-allowed',
  /** Too many tries for now. */
  TooMany = 'too-many',
  /** The email isn't one Firebase accepts. */
  BadEmail = 'bad-email',
  Unknown = 'unknown',
}
