import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Firestore rules tests. Run by `npm run test:rules` inside `firebase emulators:exec`, which
 * starts the emulator and sets FIRESTORE_EMULATOR_HOST. Separate from `ng test` (jsdom), and not
 * part of `npm run verify` because the emulator needs Java.
 */
export default defineConfig({
  // The app's path aliases (tsconfig.json), so the tests can import the enums the rules mirror.
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('src/app/shared', import.meta.url)),
      '@core': fileURLToPath(new URL('src/app/core', import.meta.url)),
    },
  },
  test: {
    include: ['tests/rules/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    // One emulator database is shared, so files must not clear it under each other.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
