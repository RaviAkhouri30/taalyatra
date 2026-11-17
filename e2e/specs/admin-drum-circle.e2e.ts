import { expect, test } from '../fixtures/test';

test.describe('Admin drum circle', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should edit the section and its pictures, and show them on the site', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Music & creativity');
    await editor
      .card('Drum circle details')
      .getByLabel(/^Title/)
      .first()
      .fill('Drum Circle, live');
    await editor
      .card('Drum circle pictures')
      .getByLabel('Description')
      .first()
      .fill('Forty people drumming together in a circle');
    await editor.waitForSave();
    await editor.publish();
    await page.goto('/');

    const section = page.locator('#drum-circle-details');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Drum Circle, live' })).toBeVisible();
    await expect(
      section.getByRole('img', { name: 'Forty people drumming together in a circle' }),
    ).toBeAttached();
  });

  test('should keep three pictures, so pictures can be replaced but not added or removed', async ({
    editor,
  }) => {
    await editor.openTab('Music & creativity');
    const pictures = editor.card('Drum circle pictures');

    await expect(pictures.getByRole('button', { name: 'Choose or upload' })).toHaveCount(3);
    await expect(pictures.getByRole('button', { name: 'Add picture' })).toBeDisabled();
  });
});
