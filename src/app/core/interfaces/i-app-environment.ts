import { type BackendType } from '@core/enums/backend-type.enum';

/** Build-time settings, provided through `APP_ENVIRONMENT`. */
export interface IAppEnvironment {
  readonly production: boolean;
  readonly backend: BackendType;
  /** Base URL that `RestHttpBackend` prefixes to endpoint paths. */
  readonly apiBaseUrl: string;
  /** Requests slower than this fail with a timeout. */
  readonly requestTimeoutMs: number;
  /** Simulated network delay of the fake backend. */
  readonly fakeLatencyMs: number;
}
