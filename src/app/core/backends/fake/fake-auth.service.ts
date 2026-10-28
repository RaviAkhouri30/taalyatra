import { inject } from '@angular/core';
import { BehaviorSubject, type Observable, defer, delay, of, tap, throwError } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError, type IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FAKE_ADMIN_ACCOUNT, FAKE_VISITOR_ACCOUNT } from './fake-auth.constants';

/**
 * In-memory auth for development and the e2e suite: knows the fake admin (UID =
 * `environment.adminUid`) and one non-admin account. The session lasts until reload.
 */
export class FakeAuthService implements IAuthService {
  public readonly user$: Observable<IAuthUser | null>;

  private readonly environment = inject(APP_ENVIRONMENT);
  private readonly current = new BehaviorSubject<IAuthUser | null>(null);
  private readonly accounts: readonly (IAuthUser & { readonly password: string })[] = [
    { ...FAKE_ADMIN_ACCOUNT, uid: this.environment.adminUid },
    FAKE_VISITOR_ACCOUNT,
  ];

  public constructor() {
    // Assigned here because it reads `current`, a private field declared after the public one.
    this.user$ = this.current.asObservable();
  }

  public signIn(email: string, password: string): Observable<IAuthUser> {
    return defer(() => {
      const account = this.accounts.find(
        (candidate) => candidate.email === email.trim() && candidate.password === password,
      );
      return account
        ? of<IAuthUser>({ uid: account.uid, email: account.email })
        : throwError(() => new AuthError(AuthErrorKind.InvalidCredentials));
    }).pipe(
      delay(this.environment.fakeLatencyMs),
      tap((user) => {
        this.current.next(user);
      }),
    );
  }

  public signOut(): Observable<void> {
    return of(undefined).pipe(
      delay(this.environment.fakeLatencyMs),
      tap(() => {
        this.current.next(null);
      }),
    );
  }

  public sendPasswordReset(_email: string, _continuePath: string): Observable<void> {
    return of(undefined).pipe(delay(this.environment.fakeLatencyMs));
  }
}
