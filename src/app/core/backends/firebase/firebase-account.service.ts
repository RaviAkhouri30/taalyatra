import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, catchError, map, throwError } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { AccountError, type IAccountService } from '@core/interfaces/i-account-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';

/** Firebase Auth's own sign-up endpoint (Identity Toolkit). */
const SIGN_UP_PATH = 'identitytoolkit.googleapis.com/v1/accounts:signUp';
/** Characters of the one-time password nobody sees; long enough that it can't be guessed. */
const PASSWORD_LENGTH = 32;
const PASSWORD_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

/** Firebase's error codes, by what they mean for the owner. */
const ERROR_KINDS: ReadonlyMap<string, AccountErrorKind> = new Map([
  ['EMAIL_EXISTS', AccountErrorKind.EmailTaken],
  ['OPERATION_NOT_ALLOWED', AccountErrorKind.NotAllowed],
  ['ADMIN_ONLY_OPERATION', AccountErrorKind.NotAllowed],
  ['TOO_MANY_ATTEMPTS_TRY_LATER', AccountErrorKind.TooMany],
  ['INVALID_EMAIL', AccountErrorKind.BadEmail],
]);

/** What the endpoint answers with. */
interface ISignUpResponse {
  readonly localId: string;
}

/**
 * Makes an account through Firebase's own sign-up API with the site's public key (0030,
 * ADR-0021). A plain request, not the Auth SDK, so the owner's own session is untouched. The
 * password is random and used once: the manager chooses their own from Firebase's email.
 */
export class FirebaseAccountService implements IAccountService {
  private readonly http = inject(HttpClient);
  private readonly apiKey = inject(FIREBASE_CONFIG)?.apiKey ?? '';
  private readonly emulator = inject(APP_ENVIRONMENT).authEmulator;
  private readonly random = globalThis.crypto;

  /** @returns The endpoint, at the Auth emulator when the build uses one. */
  private get url(): string {
    const base =
      this.emulator === null
        ? `https://${SIGN_UP_PATH}`
        : `http://${this.emulator.host}:${String(this.emulator.port)}/${SIGN_UP_PATH}`;
    return `${base}?key=${encodeURIComponent(this.apiKey)}`;
  }

  /**
   * @param code Firebase's message, e.g. `EMAIL_EXISTS` or `TOO_MANY_ATTEMPTS_TRY_LATER : …`.
   * @returns What it means for the owner.
   */
  private static kindOf(code: string): AccountErrorKind {
    return ERROR_KINDS.get(code.split(' ')[0] ?? '') ?? AccountErrorKind.Unknown;
  }

  public create(email: string): Observable<string> {
    const body = { email, password: this.password(), returnSecureToken: false };
    return this.http.post<ISignUpResponse>(this.url, body).pipe(
      map((response) => response.localId),
      catchError((error: unknown) => {
        // Read by shape, not `instanceof HttpErrorResponse`: importing that class here would add an
        // export to the site's first download, which has no room to spare.
        const body = (error as { error?: { error?: { message?: unknown } } } | null)?.error;
        const message = body?.error?.message;
        const code = typeof message === 'string' ? message : '';
        return throwError(() => new AccountError(FirebaseAccountService.kindOf(code)));
      }),
    );
  }

  private password(): string {
    const bytes = this.random.getRandomValues(new Uint8Array(PASSWORD_LENGTH));
    return Array.from(bytes, (byte) =>
      PASSWORD_CHARACTERS.charAt(byte % PASSWORD_CHARACTERS.length),
    ).join('');
  }
}
