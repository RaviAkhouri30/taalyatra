import { expect, test } from '../fixtures/test';

/**
 * Pixel-perfect regression guard (CLAUDE.md §9): one screenshot per home section on every
 * viewport. Baselines are reviewed against the design prototype when created or updated
 * (`npm run e2e:visual:update`) and are platform-specific, so they live per OS.
 */
const SECTIONS = [
  'top',
  'diwali',
  'for-everyone',
  'experiences',
  'shows',
  'drum-circle-details',
  'play',
  'watch',
  'gallery',
  'philosophy',
  'how',
  'team',
  'insta',
  'proof',
  'faq',
  'contact',
] as const;

test.describe('Home visual', () => {
  for (const anchor of SECTIONS) {
    test(`should match the approved look of #${anchor}`, async ({ home }) => {
      await home.open();
      const section = home.section(anchor);
      await section.scrollIntoViewIfNeeded();

      await expect(section).toHaveScreenshot(`${anchor}.png`, {
        stylePath: 'e2e/support/visual.css',
      });
    });
  }
});
