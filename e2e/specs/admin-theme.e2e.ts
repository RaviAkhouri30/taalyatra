import { type Page } from '@playwright/test';
import { FAKE_MANAGER_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
import { THEME_PRESETS } from '../../src/app/shared/constants/theme-presets.constants';
import { ThemePreset } from '../../src/app/shared/enums/theme-preset.enum';
import { THEME_TOKENS } from '../../src/app/shared/models/theme-tokens';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

/** The ready-made themes with a picture of the site and the admin in each (0021). */
const PICTURED = new Set<string>([
  ThemePreset.Daylight,
  ThemePreset.Festival,
  ThemePreset.HighContrast,
]);

/** A themed colour as the page's root resolves it (`--ty-…`), or the root style's own value. */
async function rootVariable(page: Page, name: string): Promise<string> {
  return page.evaluate(
    (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim(),
    name,
  );
}

/** The owner opens the Theme page and waits for its card. */
async function openTheme(editor: EditorPage): Promise<void> {
  await editor.openTab('Theme');
  await editor.card('Theme').waitFor();
}

/** The owner picks a ready-made theme and publishes it. */
async function publishPreset(editor: EditorPage, page: Page, label: string): Promise<void> {
  await openTheme(editor);
  await page.getByRole('button', { name: label, exact: true }).click();
  await editor.waitForSave();
  await editor.publish();
}

/** The editable theme (0021, ADR-0019). */
test.describe('Admin theme', () => {
  test('should define today’s colours on the page exactly as the theme’s code expects', async ({
    home,
    page,
  }) => {
    await home.open();

    for (const token of THEME_TOKENS.filter((entry) => entry.fallback.startsWith('#'))) {
      expect(await rootVariable(page, `--ty-${token.name}`), token.name).toBe(token.fallback);
    }
  });

  test.describe('signed in as the owner', () => {
    // Each publishes a theme and checks two pages on three sizes: under the full run's load these
    // passed the default timeout (0030), so they get three times as long.
    test.slow();

    test.beforeEach(async ({ editor }) => {
      await editor.signIn();
    });

    for (const preset of THEME_PRESETS.slice(1)) {
      const name = preset.label.toLowerCase().replaceAll(' ', '-');
      // Pictures for the first four (0021); the twelve of 0027 are checked by axe on both pages,
      // without 72 more baselines.
      const pictured = PICTURED.has(preset.preset);

      test(`should publish ${preset.label} to the site and the admin, readable and as approved`, async ({
        editor,
        home,
        page,
        axe,
      }) => {
        await publishPreset(editor, page, preset.label);

        await home.open();
        expect(await rootVariable(page, '--ty-ink')).toBe(preset.colours.background);
        expect((await axe().analyze()).violations).toEqual([]);
        if (pictured) {
          await page.evaluate(async () => document.fonts.ready);
          await expect(home.section('top')).toHaveScreenshot(`theme-${name}-top.png`, {
            stylePath: 'e2e/support/visual.css',
          });
        }

        await page.goto('/admin');
        await editor.heading.filter({ hasText: 'Welcome back' }).waitFor();
        expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
        if (!pictured) {
          return;
        }
        await page.addStyleTag({ content: '.db-notes { display: none !important; }' });
        await expect(page.locator('app-dashboard')).toHaveScreenshot(
          `theme-${name}-dashboard.png`,
          {
            stylePath: 'e2e/support/visual.css',
            // When it was published, and the newest release: both change from run to run.
            mask: [
              page.locator('section[aria-labelledby="db-history"] p'),
              page.locator('section[aria-labelledby="db-release"] p'),
            ],
          },
        );
      });
    }

    test('should block publishing a theme that’s hard to read, and say which colour to change', async ({
      editor,
      page,
    }) => {
      await openTheme(editor);

      await editor
        .card('Theme')
        .getByRole('textbox', { name: /^Quiet text/ })
        .fill('#3a3a3a');
      await editor.waitForSave();

      await expect(page.getByText(/pairs are hard to read/)).toBeVisible();
      await expect(page.getByText('Make the quiet text lighter.').first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeDisabled();
    });

    test('should show the draft theme in the preview before it’s published', async ({
      editor,
      page,
    }) => {
      await openTheme(editor);
      await page.getByRole('button', { name: 'High contrast', exact: true }).click();
      await editor.waitForSave();

      // Phones and tablets show the form or the preview.
      const show = page.getByRole('button', { name: 'Show preview' });
      if (await show.isVisible()) {
        await show.click();
      }

      // The preview reloads after the save, so its colours arrive a moment later.
      await expect(async () => {
        const ink = await editor.preview
          .getByRole('main')
          .evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--ty-ink').trim(),
          );
        expect(ink).toBe('#000000');
      }).toPass();
    });

    test('should put today’s look back with Reset', async ({ editor, page }) => {
      await openTheme(editor);
      const card = editor.card('Theme');
      await page.getByRole('button', { name: 'Festival', exact: true }).click();

      await card.getByRole('button', { name: 'Reset to the default theme' }).click();

      await expect(card.getByRole('textbox', { name: /^Background/ })).toHaveValue('#171210');
      await expect(page.getByRole('button', { name: 'Warm night', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('should show larger text on the site as approved', async ({ editor, home, page }) => {
      await openTheme(editor);
      await editor
        .card('Theme')
        .getByRole('combobox', { name: 'Text size' })
        .selectOption('larger');
      await editor.waitForSave();
      await editor.publish();

      await home.open();
      expect(await rootVariable(page, '--ty-text-scale')).toBe('1.1');
      await page.evaluate(async () => document.fonts.ready);
      await expect(home.section('top')).toHaveScreenshot('theme-larger-text-top.png', {
        stylePath: 'e2e/support/visual.css',
      });
    });
  });

  test('should let a manager send a theme for the owner’s approval', async ({ editor, page }) => {
    await editor.signIn();
    await editor.openTab('Team access');
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    // An existing account: pasted by its id (0030).
    await form.getByRole('checkbox', { name: /paste their User UID/ }).check();
    await form.getByRole('textbox', { name: 'User UID' }).fill(FAKE_MANAGER_ACCOUNT.uid);
    await form.getByRole('textbox', { name: 'Their email' }).fill(FAKE_MANAGER_ACCOUNT.email);
    await form.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('article', { name: FAKE_MANAGER_ACCOUNT.email }).waitFor();
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);

    await publishPresetForApproval(editor, page);

    await expect(page.getByRole('region', { name: 'Your requests' })).toContainText(
      'Waiting for the owner',
    );
  });
});

/** The manager picks Festival and sends it, as the Theme page needs approval by default. */
async function publishPresetForApproval(editor: EditorPage, page: Page): Promise<void> {
  await openTheme(editor);
  await page.getByRole('button', { name: 'Festival', exact: true }).click();
  await editor.waitForSave();
  await editor.openTab('Review & publish');
  await page.getByRole('button', { name: 'Send for approval' }).click();
  await page.getByRole('button', { name: 'Yes, send' }).click();
}
