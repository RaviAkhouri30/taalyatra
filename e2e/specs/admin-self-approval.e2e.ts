import { type Page } from '@playwright/test';
import { FAKE_MANAGER_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

const HEADLINE = 'Approved by the manager.';

/** The owner adds the fake manager, who may approve their own changes (0023). */
async function addApprovingManager(editor: EditorPage, page: Page): Promise<void> {
  await editor.openTab('Team access');
  await page.getByRole('button', { name: 'Add a manager' }).click();
  const form = page.getByRole('form', { name: 'Add a manager' });
  // An existing account: pasted by its id (0030).
  await form.getByRole('checkbox', { name: /paste their User UID/ }).check();
  await form.getByRole('textbox', { name: 'User UID' }).fill(FAKE_MANAGER_ACCOUNT.uid);
  await form.getByRole('textbox', { name: 'Their email' }).fill(FAKE_MANAGER_ACCOUNT.email);
  await form.getByRole('checkbox', { name: /^Can approve their own changes/ }).check();
  await form.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('article', { name: FAKE_MANAGER_ACCOUNT.email })).toContainText(
    'Approves their own changes',
  );
}

/** The manager changes the Hero, which needs approval, and opens Review & publish. */
async function changeHero(editor: EditorPage): Promise<void> {
  await editor.openTab('Hero');
  await editor.card('Hero').getByLabel('Headline, first line').fill(HEADLINE);
  await editor.waitForSave();
  await editor.openTab('Review & publish');
}

/** A manager who can approve their own changes (0023). */
test.describe('Admin self-approval', () => {
  test.beforeEach(async ({ editor, page }) => {
    await editor.signIn();
    await addApprovingManager(editor, page);
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);
  });

  test('should let the manager approve their change, and show the owner who and why', async ({
    editor,
    page,
  }) => {
    await changeHero(editor);
    await page.getByRole('textbox', { name: 'Title (optional)' }).fill('New headline');
    await page.getByRole('textbox', { name: 'What changed and why (optional)' }).fill('For Diwali');
    await page.getByRole('button', { name: 'Approve and publish 1 change' }).click();
    await page.getByRole('button', { name: 'Yes, approve and publish' }).click();
    await expect(page.getByText('Approved and published.')).toBeVisible();
    await editor.signOut();
    await editor.signIn();

    await expect(page.getByRole('region', { name: 'History' })).toContainText(
      '1 change self-approved by managers since you last looked.',
    );
    await editor.openTab('Review & publish');
    const history = page.getByRole('region', { name: 'Publish history' });
    await expect(history).toContainText(`self-approved by ${FAKE_MANAGER_ACCOUNT.email}`);
    await expect(history).toContainText('New headline — For Diwali');

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(HEADLINE);
  });

  test('should have no WCAG 2.2 AA violations with the approval form showing', async ({
    editor,
    page,
    axe,
  }) => {
    await changeHero(editor);
    await page.getByRole('button', { name: 'Approve and publish 1 change' }).click();
    await page.mouse.move(0, 0);

    expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
  });
});
