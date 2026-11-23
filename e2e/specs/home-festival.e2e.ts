import { type Page } from '@playwright/test';
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';
import { FESTIVAL_LOOKS } from '../../src/app/shared/constants/festival-looks.constants';
import { Festival } from '../../src/app/shared/enums/festival.enum';
import { expect, test } from '../fixtures/test';

/** Where the offline database keeps written documents (FAKE_OVERLAY_STORAGE_KEY). */
const FAKE_OVERLAY_STORAGE_KEY = 'taal-yatra.fake-db.overlay';

/** Stores the offer with `festival` as published, before the site first loads. */
async function publishFestival(page: Page, festival: Festival): Promise<void> {
  const config = fakeDb.site.config;
  const entries = [['site/config', { ...config, promotion: { ...config.promotion, festival } }]];
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: FAKE_OVERLAY_STORAGE_KEY, value: JSON.stringify(entries) },
  );
}

/** Each of the eleven looks on the site (2.16.0): the band and the badge, still in screenshots. */
test.describe('Home festival looks', () => {
  for (const look of FESTIVAL_LOOKS) {
    test(`should match the approved look for ${look.label}`, async ({ home, page }) => {
      await publishFestival(page, look.festival);
      await home.open();
      const badge = page.locator('app-promo-pill .promo');
      await badge.waitFor();
      await home.offerSection.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);

      // The floating badge and buttons are left out of the band's picture; the badge has its own.
      await expect(home.offerSection).toHaveScreenshot(`offer-${look.festival}.png`, {
        stylePath: 'e2e/support/visual.css',
      });
      await expect(badge).toHaveScreenshot(`badge-${look.festival}.png`);
    });
  }

  test('should match the approved look of the card badge on an inner page', async ({ page }) => {
    await publishFestival(page, Festival.Christmas);
    await page.goto('/shows');
    const badge = page.locator('app-promo-card .promo');
    await badge.waitFor();

    await expect(badge).toHaveScreenshot('badge-card-christmas.png');
  });

  test('should keep every particle still for a visitor who asks for less motion', async ({
    home,
    page,
  }) => {
    await publishFestival(page, Festival.NewYear);
    await home.open();
    const particle = home.offerSection.locator('.fp').first();
    await particle.waitFor({ state: 'attached' });

    await expect(particle).toHaveCSS('animation-name', 'none');
    await expect(particle).toHaveCSS('opacity', '0');
  });

  for (const festival of [Festival.Christmas, Festival.Gurpurab, Festival.Halloween]) {
    test(`should have no WCAG 2.2 AA violations with ${festival}’s look`, async ({
      axe,
      home,
      page,
    }) => {
      await publishFestival(page, festival);
      await home.open();
      await page.locator('app-promo-pill .promo').waitFor();
      await home.offerSection.scrollIntoViewIfNeeded();

      const results = await axe().include('#diwali').include('app-promo-badge').analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
