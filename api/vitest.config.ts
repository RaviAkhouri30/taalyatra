import { defineConfig } from 'vitest/config';

/** Same threshold as the site (CLAUDE.md §9). */
const COVERAGE_MINIMUM = 90;

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/testing/**'],
      reporter: ['text-summary'],
      thresholds: {
        statements: COVERAGE_MINIMUM,
        branches: COVERAGE_MINIMUM,
        functions: COVERAGE_MINIMUM,
        lines: COVERAGE_MINIMUM,
      },
    },
  },
});
