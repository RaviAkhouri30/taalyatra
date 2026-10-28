import { type Observable } from 'rxjs';
import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type IFirebaseConfig, type IFirestoreEmulator } from '@core/interfaces/i-firebase-config';

/** The Firebase Auth operations `FirebaseAuthService` needs; implemented by `AuthGateway`. */
export interface IAuthGateway {
  readonly user$: Observable<IAuthUser | null>;
  signIn(email: string, password: string): Observable<IAuthUser>;
  signOut(): Observable<void>;
  /** @param continueUrl Absolute URL the reset page links back to. */
  sendPasswordReset(email: string, continueUrl: string): Observable<void>;
}

/** Creates an auth gateway, loading the SDK chunk first. */
export type AuthGatewayLoader = (
  config: IFirebaseConfig,
  emulator: IFirestoreEmulator | null,
) => Observable<IAuthGateway>;
