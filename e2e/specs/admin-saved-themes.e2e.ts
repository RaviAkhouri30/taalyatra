import { type Page } from '@playwright/test';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

/** The Saved themes panel on the Theme page: save, rename and delete. */
function yourThemes(page: Page) {
  return page.getByRole('group', { name: 'Saved themes' });
}

/** The owner chooses a ready-made theme, then saves the form under `name`. */
async function saveAs(editor: EditorPage, page: Page, preset: string, name: string) {
  await page.getByRole('button', { name: preset, exact: true }).click();
  await editor.waitForSave();
  const panel = yourThemes(page);
  await panel.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await panel.getByRole('button', { name: 'Save as my theme' }).click();
  await expect(panel.getByRole('status')).toHaveText(`Saved as ${name}.`);
}

/** More themes, and your own saved (0027, 2.9.0), with the Fake backend. */
test.describe('Admin saved themes', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
    await editor.openTab('Theme');
    await editor.card('Theme').waitFor();
  });

  test('should save a theme and bring all of it back when chosen again', async ({
    editor,
    page,
  }) => {
    const card = editor.card('Theme');
    await card.getByRole('combobox', { name: 'Fonts' }).selectOption('space-work');
    await saveAs(editor, page, 'Monsoon', 'Spring show');
    const swatch = page
      .getByRole('group', { name: 'Your themes' })
      .getByRole('button', { name: 'Spring show' });
    await expect(swatch).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Daylight', exact: true }).click();
    await card.getByRole('combobox', { name: 'Fonts' }).selectOption('bricolage-dm');
    await swatch.click();

    await expect(card.getByRole('textbox', { name: /^Background/ })).toHaveValue('#0d2226');
    await expect(card.getByRole('combobox', { name: 'Fonts' })).toHaveValue('space-work');
    await expect(page.getByText('Below now: Your theme: Spring show')).toBeVisible();
  });

  test('should rename a saved theme, then delete it, leaving the form as it is', async ({
    editor,
    page,
  }) => {
    await saveAs(editor, page, 'Rose', 'Wedding');
    const panel = yourThemes(page);

    await panel.getByRole('button', { name: 'Rename Wedding' }).click();
    await panel.getByRole('textbox', { name: 'New name for Wedding' }).fill('Wedding reception');
    await panel.getByRole('button', { name: 'Save name' }).click();
    await expect(panel.getByRole('status')).toHaveText('Renamed to Wedding reception.');
    await panel.getByRole('button', { name: 'Delete Wedding reception' }).click();
    await panel.getByRole('button', { name: 'Yes, delete' }).click();

    await expect(panel.getByRole('status')).toContainText('Deleted Wedding reception.');
    await expect(page.getByRole('group', { name: 'Your themes' })).toHaveCount(0);
    await expect(editor.card('Theme').getByRole('textbox', { name: /^Background/ })).toHaveValue(
      '#fdf3f3',
    );
  });

  test('should refuse to save a theme that’s hard to read, and say why', async ({
    editor,
    page,
  }) => {
    await editor
      .card('Theme')
      .getByRole('textbox', { name: /^Quiet text/ })
      .fill('#3a3a3a');
    await editor.waitForSave();
    const panel = yourThemes(page);
    await panel.getByRole('textbox', { name: 'Name', exact: true }).fill('Too dark');

    await panel.getByRole('button', { name: 'Save as my theme' }).click();

    await expect(panel.getByRole('alert')).toContainText('hard-to-read');
    await expect(page.getByRole('group', { name: 'Your themes' })).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations with saved themes showing', async ({
    editor,
    page,
    axe,
  }) => {
    await saveAs(editor, page, 'Slate', 'Corporate');
    await yourThemes(page).getByRole('button', { name: 'Rename Corporate' }).click();
    await page.mouse.move(0, 0);

    expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
  });
});
