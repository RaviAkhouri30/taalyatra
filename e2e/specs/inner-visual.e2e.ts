import { type InnerPageName, expect, test } from '../fixtures/test';

/**
 * Pixel-perfect regression guard for the inner pages (CLAUDE.md §9): one screenshot per section
 * on every viewport. Baselines are reviewed against the design prototype when created or updated
 * (`npm run e2e:visual:update`).
 */
const PAGES: readonly {
  name: InnerPageName;
  sections: number;
}[] = [
  { name: 'videos', sections: 2 },
  { name: 'team', sections: 4 },
  { name: 'shows', sections: 4 },
  { name: 'achievements', sections: 6 },
];

test.describe('Inner pages visual', () => {
  for (const { name, sections } of PAGES) {
    for (let index = 0; index < sections; index += 1) {
      test(`should match the approved look of ${name} section ${String(index + 1)}`, async ({
        innerPages,
      }) => {
        const inner = innerPages[name];
        await inner.open();
        const section = inner.sections.nth(index);
        await section.scrollIntoViewIfNeeded();

        await expect(section).toHaveScreenshot(`${name}-${String(index + 1)}.png`, {
          stylePath: 'e2e/support/visual.css',
        });
      });
    }
  }
});
