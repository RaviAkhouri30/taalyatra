/**
 * Firebase web app settings. Public by design (every visitor's browser receives them), so the
 * data is protected by `firestore.rules`, not by hiding these values. Mirrors the SDK's
 * `FirebaseOptions`, so no SDK type leaks out of `core/backends`.
 */
export interface IFirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

/** Address of a local Firestore emulator. */
export interface IFirestoreEmulator {
  readonly host: string;
  readonly port: number;
}
