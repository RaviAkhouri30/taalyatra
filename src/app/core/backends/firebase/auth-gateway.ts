import { initializeApp } from 'firebase/app';
import {
  type Auth,
  type User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Observable, defer, map } from 'rxjs';
import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type IFirebaseConfig, type IFirestoreEmulator } from '@core/interfaces/i-firebase-config';
import { type IAuthGateway } from './i-auth-gateway';

/** @returns The app's view of a Firebase user. */
function toAuthUser(user: User): IAuthUser {
  return { uid: user.uid, email: user.email ?? '' };
}

/**
 * The only file that imports `firebase/auth`. `AUTH_GATEWAY_LOADER` loads it with a dynamic
 * `import()` the first time an admin route uses auth, so public pages never download it
 * (ADR-0012). Every SDK Promise is wrapped with `defer` (CLAUDE.md §7).
 */
export class AuthGateway implements IAuthGateway {
  /** The signed-in user, or `null`; Firebase restores a persisted session before the first value. */
  public readonly user$: Observable<IAuthUser | null>;

  private readonly auth: Auth;

  /**
   * @param config Firebase web settings.
   * @param emulator Local Auth emulator to use instead of the real service, or `null`.
   */
  public constructor(config: IFirebaseConfig, emulator: IFirestoreEmulator | null) {
    // initializeApp returns the existing default app when called again with the same options.
    this.auth = getAuth(initializeApp({ ...config }));
    if (emulator !== null) {
      connectAuthEmulator(this.auth, `http://${emulator.host}:${String(emulator.port)}`, {
        disableWarnings: true,
      });
    }
    const auth = this.auth;
    // onAuthStateChanged returns its unsubscribe function, which becomes the teardown.
    this.user$ = new Observable<IAuthUser | null>((subscriber) =>
      onAuthStateChanged(
        auth,
        (user) => {
          subscriber.next(user ? toAuthUser(user) : null);
        },
        (error) => {
          subscriber.error(error);
        },
      ),
    );
  }

  public signIn(email: string, password: string): Observable<IAuthUser> {
    return defer(() => signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((credential) => toAuthUser(credential.user)),
    );
  }

  public signOut(): Observable<void> {
    return defer(() => signOut(this.auth));
  }

  public sendPasswordReset(email: string, continueUrl: string): Observable<void> {
    return defer(() => sendPasswordResetEmail(this.auth, email, { url: continueUrl }));
  }
}
