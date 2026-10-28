import { type BackendType } from '@core/enums/backend-type.enum';
import { type IFirebaseConfig, type IFirestoreEmulator } from './i-firebase-config';

/** Build-time settings, provided through `APP_ENVIRONMENT`. */
export interface IAppEnvironment {
  readonly production: boolean;
  readonly backend: BackendType;
  /**
   * Public address of the site, without a trailing slash: canonical URLs, social tags, structured
   * data and the sitemap use it. Switch production to `https://taalyatra.in` when the domain
   * points at the site.
   */
  readonly siteUrl: string;
  /** Base URL that `RestHttpBackend` prefixes to endpoint paths. */
  readonly apiBaseUrl: string;
  /** Requests slower than this fail with a timeout. */
  readonly requestTimeoutMs: number;
  /** Simulated network delay of the fake backend. */
  readonly fakeLatencyMs: number;
  /**
   * Build-time Firebase settings. `null` reads them at runtime from `runtime-config.js`
   * (production); only the emulator build sets them here.
   */
  readonly firebase: IFirebaseConfig | null;
  /** Local Firestore emulator to connect to, or `null` for the real service. */
  readonly firestoreEmulator: IFirestoreEmulator | null;
  /** Local Auth emulator to connect to, or `null` for the real service. */
  readonly authEmulator: IFirestoreEmulator | null;
  /** UID of the single admin account (an identifier, not a secret; ADR-0012). */
  readonly adminUid: string;
  /** EmailJS identifiers (public by design). Empty values select the fake email adapter. */
  readonly emailJs: {
    readonly serviceId: string;
    readonly templateId: string;
    readonly publicKey: string;
  };
}
