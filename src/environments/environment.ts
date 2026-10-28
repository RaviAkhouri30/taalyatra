import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/** Production settings. Firebase config is read at runtime from `runtime-config.js`. */
export const environment: IAppEnvironment = {
  production: true,
  backend: BackendType.Firebase,
  siteUrl: 'https://calm-mud-0ca950310.4.azurestaticapps.net',
  apiBaseUrl: '',
  requestTimeoutMs: 60_000,
  firebase: null,
  firestoreEmulator: null,
  authEmulator: null,
  adminUid: '5zsz2DlUaja2Ss7wbFTrpiMMROk2',
  fakeLatencyMs: 0,
  // Fill in from the EmailJS dashboard to send real email; empty values use the fake adapter.
  emailJs: { serviceId: '', templateId: '', publicKey: '' },
};
