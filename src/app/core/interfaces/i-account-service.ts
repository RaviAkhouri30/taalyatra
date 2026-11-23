import { type Observable } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';

/** What the owner is told when an account couldn't be made (0030). */
export const ACCOUNT_ERROR_MESSAGES: Readonly<Record<AccountErrorKind, string>> = {
  [AccountErrorKind.EmailTaken]:
    'This email already has an account. Paste their User UID from the Firebase console instead.',
  [AccountErrorKind.NotAllowed]:
    'New accounts can’t be made from here: sign-up is turned off in Firebase. Create the account in the Firebase console and paste its User UID.',
  [AccountErrorKind.TooMany]: 'Too many tries just now. Please wait a few minutes and try again.',
  [AccountErrorKind.BadEmail]: 'Firebase doesn’t accept this email. Check it and try again.',
  [AccountErrorKind.Unknown]: 'Couldn’t make their account. Please try again.',
};

/** An account that couldn't be made, and why. */
export class AccountError extends Error {
  /** @param kind Why. */
  public constructor(public readonly kind: AccountErrorKind) {
    super(`Account not created: ${kind}`);
    this.name = 'AccountError';
  }

  /**
   * @param error Anything thrown.
   * @returns Its kind; `Unknown` for anything that isn't an `AccountError`.
   */
  public static kindOf(error: unknown): AccountErrorKind {
    return error instanceof AccountError ? error.kind : AccountErrorKind.Unknown;
  }

  /**
   * @param error Anything thrown.
   * @returns What the owner is told about it.
   */
  public static messageOf(error: unknown): string {
    return ACCOUNT_ERROR_MESSAGES[AccountError.kindOf(error)];
  }
}

/**
 * Makes a manager's sign-in account (0030, ADR-0021), so the owner adds a manager with their email
 * alone. The owner stays signed in. A new account can do nothing until its role exists. Provided on
 * the admin routes only.
 */
export abstract class IAccountService {
  /**
   * @param email The manager's email.
   * @returns Emits the new account's user id once, or fails with an `AccountError`.
   */
  public abstract create(email: string): Observable<string>;
}
