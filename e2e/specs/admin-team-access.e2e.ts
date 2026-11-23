import { FAKE_MANAGER_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
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
    // An existing account: pasted by its id (0030).
    await form.getByRole('checkbox', { name: /paste their User UID/ }).check();
    await form.getByRole('textbox', { name: 'User UID' }).fill(MANAGER_UID);
    await form.getByRole('textbox', { name: 'Their email' }).fill(MANAGER_EMAIL);
    await form
      .getByRole('radiogroup', { name: 'Team', exact: true })
      .getByRole('radio', { name: 'Hidden' })
      .check();
    await form.getByRole('button', { name: 'Save' }).click();

    const card = page.getByRole('article', { name: MANAGER_EMAIL });
    await expect(card).toContainText(MANAGER_UID);
    await expect(card).toContainText('Hidden');
    await expect(card).toContainText('Can upload');

    await card.getByRole('button', { name: `Change ${MANAGER_EMAIL}` }).click();
    const change = page.getByRole('form', { name: `Change ${MANAGER_EMAIL}` });
    // The id is fixed once added: shown as text, not a box (0030).
    await expect(change.locator('code')).toHaveText(MANAGER_UID);
    await change
      .getByRole('radiogroup', { name: 'Hero', exact: true })
      .getByRole('radio', { name: 'Can publish' })
      .check();
    await change.getByRole('checkbox', { name: /^Can upload photos/ }).uncheck();
    await change.getByRole('button', { name: 'Save' }).click();
    await expect(card).toContainText('Can publish');
    await expect(card).toContainText('Can’t upload');

    await page.reload();
    await expect(page.getByRole('article', { name: MANAGER_EMAIL })).toContainText('Can publish');

    await page.getByRole('button', { name: `Remove ${MANAGER_EMAIL}` }).click();
    await page.getByRole('button', { name: 'Yes, remove' }).click();
    await expect(page.getByText('No managers yet')).toBeVisible();
  });

  test('should add a manager with their email alone, and email them a password link', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await expect(form.getByRole('textbox', { name: 'User UID' })).toHaveCount(0);
    await form.getByRole('textbox', { name: 'Their email' }).fill('new.helper@taalyatra.test');
    await form
      .getByRole('group', { name: 'Set all to' })
      .getByRole('button', { name: 'Can publish' })
      .click();

    await form.getByRole('button', { name: 'Create and invite' }).click();

    const card = page.getByRole('article', { name: 'new.helper@taalyatra.test' });
    await expect(card).toContainText('fake-new-helper-taalyatra-test');
    await expect(card).toContainText('Can publish');
    await expect(page.getByText('We’ve emailed them a link to set their password')).toBeVisible();
  });

  test('should offer the id’s box when the email already has an account', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await form.getByRole('textbox', { name: 'Their email' }).fill(FAKE_MANAGER_ACCOUNT.email);

    await form.getByRole('button', { name: 'Create and invite' }).click();

    await expect(form.getByRole('alert')).toContainText('This email already has an account');
    await expect(form.getByRole('checkbox', { name: /paste their User UID/ })).toBeChecked();
    await expect(form.getByRole('textbox', { name: 'User UID' })).toBeVisible();
    await expect(form.getByRole('textbox', { name: 'Their email' })).toHaveValue(
      FAKE_MANAGER_ACCOUNT.email,
    );
  });

  test('should explain what to fix before saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    // An existing account: pasted by its id (0030).
    await form.getByRole('checkbox', { name: /paste their User UID/ }).check();
    await form.getByRole('textbox', { name: 'User UID' }).fill('has spaces in it');
    await form.getByRole('button', { name: 'Save' }).click();

    await expect(form).toContainText('Paste the User UID from Firebase');
    await expect(form).toContainText('Fill this in.');
    await expect(page.getByRole('article')).toHaveCount(0);
  });

  test('should match the approved look of the manager form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await form.waitFor();
    await page.mouse.move(0, 0);

    await expect(form).toHaveScreenshot('manager-form.png');
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
