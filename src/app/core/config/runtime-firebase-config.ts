import { type IFirebaseConfig } from '@core/interfaces/i-firebase-config';

/** Global that `public/runtime-config.js` sets before the app bundle runs. */
export const RUNTIME_FIREBASE_CONFIG_KEY = '__FIREBASE_CONFIG__';

const REQUIRED_KEYS: readonly (keyof IFirebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

/**
 * @param value Anything read from outside the app.
 * @returns Whether `value` carries every Firebase setting as a non-empty string.
 */
export function isFirebaseConfig(value: unknown): value is IFirebaseConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const fields = new Map(Object.entries(value));
  return REQUIRED_KEYS.every((key) => {
    const field: unknown = fields.get(key);
    return typeof field === 'string' && field.length > 0;
  });
}

/**
 * Reads the Firebase settings injected at deploy time (CLAUDE.md §10: never in source).
 * @param source Object holding the global; `globalThis` outside tests.
 * @returns The settings, or `null` when the file is missing or incomplete.
 */
export function readRuntimeFirebaseConfig(source: object = globalThis): IFirebaseConfig | null {
  const value: unknown = Reflect.get(source, RUNTIME_FIREBASE_CONFIG_KEY);
  return isFirebaseConfig(value) ? value : null;
}
