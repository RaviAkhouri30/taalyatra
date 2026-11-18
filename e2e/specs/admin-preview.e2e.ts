import { expect, test } from '../fixtures/test';

/** The live preview beside the editor (0008 D7, 0015, 1.11.0). */
test.describe('Admin preview', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should show the section the open tab edits', async ({ editor, page }) => {
    await editor.openTab('Proposal form');
    // Phones and tablets keep the preview behind a switch.
    const showPreview = page.getByRole('button', { name: 'Show preview' });
    if (await showPreview.isVisible()) {
      await showPreview.click();
    }

    await expect(editor.preview.locator('#contact')).toBeInViewport();
  });

  test('should keep the visitor-only floating buttons and badge out of the preview', async ({
    editor,
  }) => {
    await editor.openTab('Hero');

    // Attached, not visible: phones keep the preview behind a switch, but it still loads.
    await expect(editor.preview.locator('app-home-hero')).toBeAttached();
    await expect(editor.preview.locator('app-home-assistant')).toHaveCount(0);
    await expect(editor.preview.locator('app-promo-badge')).toHaveCount(0);
    await expect(editor.preview.locator('app-whatsapp-fab')).toHaveCount(0);
    await expect(editor.preview.locator('app-mobile-action-bar')).toHaveCount(0);
  });

  test('should keep them on the full preview, which shows what visitors see', async ({ page }) => {
    await page.goto('/?preview=1');

    await expect(page.locator('app-home-assistant')).toBeAttached();
    await expect(page.locator('app-promo-badge')).toBeAttached();
  });

  test('should open the card that edits a section clicked in the preview', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Hero');
    const showPreview = page.getByRole('button', { name: 'Show preview' });
    if (await showPreview.isVisible()) {
      await showPreview.click();
    }
    const section = editor.preview.locator('#drum-circle-details');
    await section.scrollIntoViewIfNeeded();

    await section.click({ position: { x: 40, y: 40 } });

    await expect(page).toHaveURL(/\/admin\/drum-circle#card-drum-circle$/);
    await expect(editor.card('Drum circle details')).toBeVisible();
  });
});
