import { type Page } from '@playwright/test';
import { FAKE_MANAGER_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

const HEADLINE = 'Drum with the manager.';

/** The owner adds the fake manager on Team access, as they would a real one. */
async function addManager(editor: EditorPage, page: Page): Promise<void> {
  await editor.openTab('Team access');
  await page.getByRole('button', { name: 'Add a manager' }).click();
  const form = page.getByRole('form', { name: 'Add a manager' });
  await form.getByRole('textbox', { name: 'User UID' }).fill(FAKE_MANAGER_ACCOUNT.uid);
  await form.getByRole('textbox', { name: 'Their email' }).fill(FAKE_MANAGER_ACCOUNT.email);
  await form.getByRole('combobox', { name: 'Team', exact: true }).selectOption('hidden');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('article', { name: FAKE_MANAGER_ACCOUNT.email }).waitFor();
}

/** The manager edits the Hero and sends it for approval with a note. */
async function sendHero(editor: EditorPage, page: Page): Promise<void> {
  await editor.openTab('Hero');
  await editor.card('Hero').getByLabel('Headline, first line').fill(HEADLINE);
  await editor.waitForSave();
  await editor.openTab('Review & publish');
  await page.getByRole('textbox', { name: 'A note for the owner (optional)' }).fill('New headline');
  await page.getByRole('button', { name: 'Send for approval' }).click();
  await page.getByRole('button', { name: 'Yes, send' }).click();
  await expect(page.getByRole('region', { name: 'Your requests' })).toContainText(
    'Waiting for the owner',
  );
}

/** Roles and approvals (0019): a manager's limited menu, sending for approval, and answers. */
test.describe('Admin approvals', () => {
  test.beforeEach(async ({ editor, page }) => {
    await editor.signIn();
    await addManager(editor, page);
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);
  });

  test('should show the manager only the pages that are theirs', async ({ editor }) => {
    // Phones and tablets keep the panel behind a menu.
    if (await editor.menu.isVisible()) {
      await editor.menu.click();
    }
    await expect(editor.tabs.getByRole('link', { name: 'Hero' })).toHaveCount(1);
    for (const name of ['Team', 'Leads', 'Visits', 'Team access']) {
      await expect(editor.tabs.getByRole('link', { name, exact: true })).toHaveCount(0);
    }
  });

  test('should send a change for approval, which the owner approves', async ({ editor, page }) => {
    await sendHero(editor, page);
    await editor.signOut();
    await editor.signIn();

    await editor.openTab('Review & publish');
    const queue = page.getByRole('region', { name: 'Waiting for your approval (1)' });
    await expect(queue).toContainText(FAKE_MANAGER_ACCOUNT.email);
    await expect(queue).toContainText('New headline');
    await queue.getByRole('button', { name: 'Approve and publish' }).click();
    await expect(page.getByText('Approved and published.')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Publish history' })).toContainText(
      `approved from ${FAKE_MANAGER_ACCOUNT.email}`,
    );

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(HEADLINE);
  });

  test('should send a change back, and the manager sees why', async ({ editor, page }) => {
    await sendHero(editor, page);
    await editor.signOut();
    await editor.signIn();
    await editor.openTab('Review & publish');
    const queue = page.getByRole('region', { name: 'Waiting for your approval (1)' });
    await queue.getByRole('button', { name: 'Send back' }).click();
    await queue.getByRole('textbox').fill('Shorter, please.');
    await queue.getByRole('button', { name: 'Send back' }).click();
    await expect(page.getByText('Sent back with your reason.')).toBeVisible();
    await editor.signOut();

    await editor.signIn(FAKE_MANAGER_ACCOUNT);
    await editor.openTab('Review & publish');
    const requests = page.getByRole('region', { name: 'Your requests' });
    await expect(requests).toContainText('Shorter, please.');
    await expect(page.getByRole('checkbox', { name: /^Hero/ })).toBeChecked();
    await requests.getByRole('button', { name: 'Clear' }).click();
    await expect(requests).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations on the approval pages', async ({
    editor,
    axe,
    page,
  }) => {
    await sendHero(editor, page);
    await editor.signOut();
    await editor.signIn();
    await editor.openTab('Review & publish');
    await page.getByRole('region', { name: 'Waiting for your approval (1)' }).waitFor();
    // Outlined buttons fade in from the solid style as they first draw; scan the settled look.
    for (const button of await page.locator('.btn--ghost').all()) {
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }

    const results = await axe().exclude('iframe').analyze();

    expect(results.violations).toEqual([]);
  });
});
