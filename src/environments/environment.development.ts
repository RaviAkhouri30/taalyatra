import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/** Local development settings (replaces `environment.ts` in development builds). */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Fake,
  apiBaseUrl: '',
  requestTimeoutMs: 60_000,
  fakeLatencyMs: 250,
  // Fill in from the EmailJS dashboard to send real email; empty values use the fake adapter.
  emailJs: { serviceId: '', templateId: '', publicKey: '' },
};
