import { expect, test } from '../fixtures/test';

/** An account id as the Firebase console shows it; the fake backend has no such user. */
const MANAGER_UID = 'e2eManagerUid0123456789abcd';
const MANAGER_EMAIL = 'content-manager@taalyatra.test';

/** Team access (0019): the owner adds, changes and removes a manager. */
test.describe('Admin team access', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
    await editor.openTab('Team access');
  });

  test('should add a manager with the defaults, then change and remove them', async ({ page }) => {
    await expect(page.getByText('No managers yet')).toBeVisible();

    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await form.getByRole('textbox', { name: 'User UID' }).fill(MANAGER_UID);
    await form.getByRole('textbox', { name: 'Their email' }).fill(MANAGER_EMAIL);
    await form.getByRole('combobox', { name: 'Team' }).selectOption('hidden');
    await form.getByRole('button', { name: 'Save' }).click();

    const card = page.getByRole('article', { name: MANAGER_EMAIL });
    await expect(card).toContainText(MANAGER_UID);
    await expect(card).toContainText('Hidden');
    await expect(card).toContainText('Can upload');

    await card.getByRole('button', { name: `Change ${MANAGER_EMAIL}` }).click();
    const change = page.getByRole('form', { name: `Change ${MANAGER_EMAIL}` });
    await expect(change.getByRole('textbox', { name: 'User UID' })).toBeDisabled();
    await change.getByRole('combobox', { name: 'Hero' }).selectOption('publish');
    await change.getByRole('checkbox').uncheck();
    await change.getByRole('button', { name: 'Save' }).click();
    await expect(card).toContainText('Can publish');
    await expect(card).toContainText('Can’t upload');

    await page.reload();
    await expect(page.getByRole('article', { name: MANAGER_EMAIL })).toContainText('Can publish');

    await page.getByRole('button', { name: `Remove ${MANAGER_EMAIL}` }).click();
    await page.getByRole('button', { name: 'Yes, remove' }).click();
    await expect(page.getByText('No managers yet')).toBeVisible();
  });

  test('should explain what to fix before saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await form.getByRole('textbox', { name: 'User UID' }).fill('has spaces in it');
    await form.getByRole('button', { name: 'Save' }).click();

    await expect(form).toContainText('Paste the User UID from Firebase');
    await expect(form).toContainText('Fill this in.');
    await expect(page.getByRole('article')).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations', async ({ axe, page }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    await page.getByRole('form', { name: 'Add a manager' }).waitFor();
    // Outlined buttons fade in from the solid style as they first draw; scan the settled look.
    for (const button of await page.locator('.btn--ghost').all()) {
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }

    const results = await axe().exclude('iframe').analyze();

    expect(results.violations).toEqual([]);
  });
});
