import { InjectionToken, inject } from '@angular/core';
import { readRuntimeFirebaseConfig } from '@core/config/runtime-firebase-config';
import { type IFirebaseConfig } from '@core/interfaces/i-firebase-config';
import { APP_ENVIRONMENT } from './app-environment.token';

/**
 * Firebase web settings: the build-time `environment.firebase` when set (emulator build),
 * otherwise `runtime-config.js`. `null` when neither provides them.
 */
export const FIREBASE_CONFIG = new InjectionToken<IFirebaseConfig | null>('FIREBASE_CONFIG', {
  providedIn: 'root',
  factory: () => inject(APP_ENVIRONMENT).firebase ?? readRuntimeFirebaseConfig(),
});
