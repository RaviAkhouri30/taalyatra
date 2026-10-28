import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/** Local development settings (replaces `environment.ts` in development builds). */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Fake,
  siteUrl: 'http://localhost:4200',
  apiBaseUrl: '',
  requestTimeoutMs: 60_000,
  firebase: null,
  firestoreEmulator: null,
  authEmulator: null,
  // The fake admin account's UID (fake-auth.constants.ts); not a real account.
  adminUid: 'fake-admin-uid',
  fakeLatencyMs: 250,
  // Fill in from the EmailJS dashboard to send real email; empty values use the fake adapter.
  emailJs: { serviceId: '', templateId: '', publicKey: '' },
};
