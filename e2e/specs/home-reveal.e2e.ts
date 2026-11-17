import { expect, test } from '../fixtures/test';

test.describe('Home reveal', () => {
  // The suite runs with reduced motion, which turns the reveal off; these tests need it on.
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('should fade a lower section in as it scrolls into view', async ({ home, page }) => {
    await home.open();
    const shows = page.locator('app-home-shows');
    await expect(shows).toHaveCSS('opacity', '0');

    await home.section('shows').scrollIntoViewIfNeeded();

    await expect(shows).toHaveCSS('opacity', '1');
  });

  test('should land exactly on a linked section', async ({ home }) => {
    await home.open('contact');

    await expect(home.contactSection).toBeInViewport();
    // Within 2 px: tablets round sub-pixel positions (before the fix it stopped thousands short).
    await expect
      .poll(() =>
        home.contactSection.evaluate((section) => Math.abs(section.getBoundingClientRect().top)),
      )
      .toBeLessThanOrEqual(2);
  });

  test('should leave everything visible when the visitor asks for less motion', async ({
    home,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await home.open();

    await expect(page.locator('app-home-shows')).toHaveCSS('opacity', '1');
  });
});
