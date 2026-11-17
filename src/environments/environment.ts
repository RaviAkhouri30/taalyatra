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
  cloudinary: { cloudName: 'zqu2cpih' },
  reportVitals: true,
  // Public by design (ADR-0006). The free plan has no domain lock: see the exception there.
  emailJs: {
    serviceId: 'service_932a32s',
    templateId: 'template_xy3amdu',
    publicKey: 'FFg5vZcafY-iAWML3',
  },
};
