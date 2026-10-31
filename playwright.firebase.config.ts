import { defineConfig, devices } from '@playwright/test';

/**
 * Firebase smoke suite (CLAUDE.md §9): the real Firestore SDK against the local emulator, seeded
 * from fake-db.json. Separate from the main config, which stays on the deterministic Fake backend.
 * Needs Java for the emulator.
 */
// E2E_FIREBASE_PORT moves the dev server when 4310 is taken by something else on the machine.
const PORT = Number(process.env['E2E_FIREBASE_PORT'] ?? 4310);
const BASE_URL = `http://localhost:${String(PORT)}`;
const isCi = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e/specs',
  testMatch: 'firebase-*.e2e.ts',
  // One emulator database is shared by every test.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/firebase' }]],
  use: {
    baseURL: BASE_URL,
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // emulators:exec starts the emulator, runs the command, and stops the emulator when
    // Playwright stops the dev server. The CLI runs the emulator's JVM in its own process
    // group, so Playwright's default SIGKILL would orphan it (and hold port 8080). SIGINT lets
    // the CLI shut its emulators down first.
    command:
      'npx firebase emulators:exec --only firestore,auth --project demo-taal-yatra ' +
      `"node scripts/seed-firestore.mjs --emulator && npx ng serve --configuration emulator --port ${String(PORT)}"`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 240_000,
    gracefulShutdown: { signal: 'SIGINT', timeout: 15_000 },
  },
});
