import { type Page } from '@playwright/test';
import { FAKE_MANAGER_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';
import { seedVisitorData } from '../fixtures/visitor-data';

/** The owner adds the fake manager on Team access with some of the owner's areas switched on. */
async function addManagerWith(editor: EditorPage, page: Page, areas: string[]): Promise<void> {
  await editor.openTab('Team access');
  await page.getByRole('button', { name: 'Add a manager' }).click();
  const form = page.getByRole('form', { name: 'Add a manager' });
  // An existing account: pasted by its id (0030).
  await form.getByRole('checkbox', { name: /paste their User UID/ }).check();
  await form.getByRole('textbox', { name: 'User UID' }).fill(FAKE_MANAGER_ACCOUNT.uid);
  await form.getByRole('textbox', { name: 'Their email' }).fill(FAKE_MANAGER_ACCOUNT.email);
  for (const area of areas) {
    await form.getByRole('checkbox', { name: `${area}:` }).check();
  }
  await form.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('article', { name: FAKE_MANAGER_ACCOUNT.email }).waitFor();
}

/**
 * Moves the pointer off the page and waits for every transition to end, so axe sees colours as
 * they settle, not a hovered button half-way through fading.
 */
async function settle(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );
}

/** Opens the menu on phones and tablets, where it's a drawer. */
async function openMenu(editor: EditorPage): Promise<void> {
  await editor.heading.waitFor();
  if (await editor.menu.isVisible()) {
    await editor.menu.click();
  }
}

/** The owner's areas for chosen managers (0022). */
test.describe('Admin manager areas', () => {
  test('should give a manager Leads and Visits, and show the owner who changed a lead', async ({
    editor,
    page,
  }) => {
    await editor.signIn();
    await seedVisitorData(page);
    await addManagerWith(editor, page, ['Leads', 'Visits and speed']);
    await expect(page.getByRole('article', { name: FAKE_MANAGER_ACCOUNT.email })).toContainText(
      'Leads, Visits and speed',
    );
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);

    await openMenu(editor);
    await expect(editor.tabs.getByRole('link', { name: 'Visits', exact: true })).toHaveCount(1);
    await expect(editor.tabs.getByRole('link', { name: 'Team access' })).toHaveCount(0);
    // The drawer opened above closes again, so the next page is opened as usual.
    await page.keyboard.press('Escape');
    await editor.openTab('Leads');
    const asha = page.getByRole('article', { name: 'Asha Rao' });
    await asha.getByLabel('Status').selectOption('contacted');
    await expect(asha).toContainText('Contacted by you');
    await expect(asha.getByRole('button', { name: 'Remove' })).toHaveCount(0);
    await editor.signOut();
    await editor.signIn();

    await editor.openTab('Leads');
    await expect(page.getByRole('article', { name: 'Asha Rao' })).toContainText(
      `Contacted by ${FAKE_MANAGER_ACCOUNT.email}`,
    );
  });

  test('should let a manager with Backups download one, but not restore', async ({
    editor,
    page,
  }) => {
    await editor.signIn();
    await addManagerWith(editor, page, ['Backups']);
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);

    await editor.openTab('Review & publish');

    const backups = page.getByRole('region', { name: 'Backups' });
    await expect(backups.getByRole('button', { name: 'Download a backup' })).toBeVisible();
    await expect(backups.getByText('Restore from a file')).toHaveCount(0);
    await expect(backups.getByText('Include leads')).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations on Team access, Leads and Visits', async ({
    editor,
    page,
    axe,
  }) => {
    await editor.signIn();
    await addManagerWith(editor, page, ['Leads', 'Visits and speed']);
    await page.getByRole('button', { name: `Change ${FAKE_MANAGER_ACCOUNT.email}` }).click();
    await settle(page);
    expect((await axe().analyze()).violations).toEqual([]);
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);

    for (const name of ['Leads', 'Visits']) {
      await editor.openTab(name);
      await settle(page);
      expect((await axe().analyze()).violations, name).toEqual([]);
    }
  });
});
