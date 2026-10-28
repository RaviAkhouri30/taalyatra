import { defineConfig } from 'vitest/config';

/**
 * Firestore rules tests. Run by `npm run test:rules` inside `firebase emulators:exec`, which
 * starts the emulator and sets FIRESTORE_EMULATOR_HOST. Separate from `ng test` (jsdom), and not
 * part of `npm run verify` because the emulator needs Java.
 */
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    // One emulator database is shared, so files must not clear it under each other.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
