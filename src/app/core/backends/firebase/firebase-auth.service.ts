import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type Observable, catchError, of, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError, type IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { toAuthError } from './auth-error.mapper';
import { AUTH_GATEWAY_LOADER } from './auth-gateway-loader.token';
import { type IAuthGateway } from './i-auth-gateway';

/**
 * Firebase Authentication adapter (ADR-0012). The SDK loads on first use (`AUTH_GATEWAY_LOADER`);
 * failures become `AuthError`s, so no Firebase type or code reaches the app.
 */
export class FirebaseAuthService implements IAuthService {
  public readonly user$: Observable<IAuthUser | null>;

  private readonly origin = inject(DOCUMENT).location.origin;
  private readonly gateway$: Observable<IAuthGateway> | null;

  public constructor() {
    const config = inject(FIREBASE_CONFIG);
    const load = inject(AUTH_GATEWAY_LOADER);
    // shareReplay: the chunk loads and the SDK initialises once; a failed load isn't cached.
    this.gateway$ =
      config === null
        ? null
        : load(config, inject(APP_ENVIRONMENT).authEmulator).pipe(
            shareReplay({ bufferSize: 1, refCount: false }),
          );
    // refCount: the auth-state listener lives only while someone is subscribed.
    this.user$ =
      this.gateway$ === null
        ? of(null)
        : this.gateway$.pipe(
            switchMap((gateway) => gateway.user$),
            shareReplay({ bufferSize: 1, refCount: true }),
          );
  }

  public signIn(email: string, password: string): Observable<IAuthUser> {
    return this.call((gateway) => gateway.signIn(email, password));
  }

  public signOut(): Observable<void> {
    return this.call((gateway) => gateway.signOut());
  }

  public sendPasswordReset(email: string, continuePath: string): Observable<void> {
    return this.call((gateway) =>
      gateway.sendPasswordReset(email, `${this.origin}${continuePath}`),
    );
  }

  /** Runs `request` on the gateway and turns any failure into an `AuthError`. */
  private call<T>(request: (gateway: IAuthGateway) => Observable<T>): Observable<T> {
    if (this.gateway$ === null) {
      return throwError(() => new AuthError(AuthErrorKind.Unavailable));
    }
    return this.gateway$.pipe(
      // gateway$ emits exactly once, so no flattening strategy can drop or reorder anything.
      switchMap(request),
      catchError((error: unknown) => throwError(() => toAuthError(error))),
    );
  }
}
