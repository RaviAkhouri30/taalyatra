import { expect, test } from '../fixtures/test';

test.describe('Home journeys', () => {
  test('should browse the gallery in the photo viewer and return focus on close', async ({
    home,
  }) => {
    await home.open('gallery');
    const tiles = home.section('gallery').getByRole('button', { name: /^Open photo:/ });
    const viewer = home.page.getByRole('dialog', { name: 'Photo viewer' });

    await tiles.first().click();
    await expect(viewer).toBeVisible();
    await expect(viewer).toContainText(/· 1 of \d+/);
    // The viewer handles keys once it has focus; it moves focus to its close button on open.
    await expect(viewer.getByRole('button', { name: 'Close photo viewer' })).toBeFocused();

    await home.page.keyboard.press('ArrowRight');
    await expect(viewer).toContainText(/· 2 of \d+/);

    await home.page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(tiles.nth(1)).toBeFocused();
  });

  test('should open and close FAQ answers', async ({ home }) => {
    await home.open('faq');
    const questions = home.section('faq').locator('details');

    await expect(questions.first()).toHaveAttribute('open', '');
    await questions.nth(1).locator('summary').click();

    await expect(questions.nth(1)).toHaveAttribute('open', '');
  });

  test('should take the visitor from the mid-page band to the proposal form', async ({ home }) => {
    await home.open('philosophy');

    await home.page
      .locator('app-home-mid-cta')
      .getByRole('link', { name: 'Request proposal' })
      .click();

    await expect(home.page).toHaveURL(/#contact$/);
    await expect(home.contactSection.getByRole('heading', { level: 2 })).toBeInViewport();
  });

  test('should link each video to YouTube', async ({ home }) => {
    await home.open('watch');
    const videos = home.section('watch').getByRole('link', { name: /Watch/ });

    await expect(videos.first()).toHaveAttribute('href', /youtube\.com|youtu\.be/);
  });
});
