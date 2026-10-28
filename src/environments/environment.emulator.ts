import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/**
 * Firebase smoke-suite settings: the app talks to the local Firestore emulator. The `demo-`
 * project prefix makes the emulator refuse to reach any real Firebase resource.
 */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Firebase,
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
  // Created by `seed-firestore.mjs --emulator`; keep in step with that script.
  adminUid: 'emulator-admin-uid',
  fakeLatencyMs: 0,
  emailJs: { serviceId: '', templateId: '', publicKey: '' },
};
