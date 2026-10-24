import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration (CLAUDE.md §9).
 *
 * Runs every journey on desktop, tablet and mobile viewports so pixel-perfect layouts are
 * verified at each breakpoint. The dev server is started automatically for local runs.
 */
const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;
const isCi = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e/specs',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : '50%',
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    // Pixel-perfect checks: allow only anti-aliasing noise.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm start -- --port 4200',
    url: BASE_URL,
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
