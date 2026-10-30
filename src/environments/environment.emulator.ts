import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/**
 * Firebase smoke-suite settings: the app talks to the local Firestore emulator. The `demo-`
 * project prefix makes the emulator refuse to reach any real Firebase resource.
 */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Firebase,
  siteUrl: 'http://localhost:4310',
  apiBaseUrl: '',
  requestTimeoutMs: 60_000,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-taal-yatra.firebaseapp.com',
    projectId: 'demo-taal-yatra',
    storageBucket: 'demo-taal-yatra.firebasestorage.app',
    messagingSenderId: '000000000000',
    appId: 'demo-app-id',
  },
  firestoreEmulator: { host: '127.0.0.1', port: 8080 },
  authEmulator: { host: '127.0.0.1', port: 9099 },
  // The production admin UID, which firestore.rules checks. `seed-firestore.mjs --emulator`
  // creates an emulator user with it; keep the two in step.
  adminUid: '5zsz2DlUaja2Ss7wbFTrpiMMROk2',
  fakeLatencyMs: 0,
  emailJs: { serviceId: '', templateId: '', publicKey: '' },
};
