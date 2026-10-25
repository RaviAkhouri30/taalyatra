import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/** Production settings. Switch `backend` to Firebase once it is set up. */
export const environment: IAppEnvironment = {
  production: true,
  backend: BackendType.Fake,
  apiBaseUrl: '',
  requestTimeoutMs: 60_000,
  fakeLatencyMs: 0,
};
