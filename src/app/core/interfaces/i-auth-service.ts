import { type Observable } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';

/** A signed-in account, as the app sees it (no provider types). */
export interface IAuthUser {
  readonly uid: string;
  /** Empty when the provider has no email for the account. */
  readonly email: string;
}

/** A failed authentication request, with a provider-independent reason. */
export class AuthError extends Error {
  public constructor(public readonly kind: AuthErrorKind) {
    super(`Authentication failed: ${kind}`);
    this.name = 'AuthError';
  }

  /**
   * @param error Anything an auth call failed with.
   * @returns Its kind, or `Unknown` when it isn't an `AuthError`.
   */
  public static kindOf(error: unknown): AuthErrorKind {
    return error instanceof AuthError ? error.kind : AuthErrorKind.Unknown;
  }
}

/**
 * Port for signing in (CLAUDE.md §3, ADR-0012). Also the DI token; `authServiceFactory` picks
 * the Firebase adapter or the fake one. Every call is a cold Observable; failures are `AuthError`s.
 */
export abstract class IAuthService {
  /** The signed-in account, or `null`; emits the current state to each new subscriber. */
  public abstract readonly user$: Observable<IAuthUser | null>;

  /** Signs in; emits the account once and completes. */
  public abstract signIn(email: string, password: string): Observable<IAuthUser>;

  /** Signs out; emits once and completes. */
  public abstract signOut(): Observable<void>;

  /**
   * Sends a password-reset email.
   * @param email The account's email.
   * @param continuePath Path in this app the reset page links back to, e.g. `/admin/sign-in`.
   */
  public abstract sendPasswordReset(email: string, continuePath: string): Observable<void>;
}
