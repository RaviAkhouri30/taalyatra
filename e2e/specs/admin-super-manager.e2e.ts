import { type Page } from '@playwright/test';
import {
  FAKE_MANAGER_ACCOUNT,
  FAKE_SUPER_MANAGER_ACCOUNT,
} from '../../src/app/core/backends/fake/fake-auth.constants';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

const HEADLINE = 'Approved for the owner.';
/** Noon in India on the super manager's last day, so the end comes twelve hours later. */
const LAST_DAY = '2026-11-30';
const LAST_DAY_NOON = new Date('2026-11-30T12:00:00+05:30');

/** The owner adds a manager on Team access, as they would a real one. */
async function addManager(
  page: Page,
  account: { uid: string; email: string },
  superUntil?: string | null,
): Promise<void> {
  await page.getByRole('button', { name: 'Add a manager' }).click();
  const form = page.getByRole('form', { name: 'Add a manager' });
  await form.getByRole('textbox', { name: 'User UID' }).fill(account.uid);
  await form.getByRole('textbox', { name: 'Their email' }).fill(account.email);
  if (superUntil !== undefined) {
    await form.getByRole('checkbox', { name: /^Super manager/ }).check();
    if (superUntil === null) {
      await form.getByRole('radio', { name: 'For good' }).check();
    } else {
      await form.getByLabel('Last day').fill(superUntil);
    }
  }
  await form.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('article', { name: account.email }).waitFor();
}

/** The manager edits the Hero, which needs approval, and sends it with a note. */
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

/** Opens the side panel on phones and tablets, where it hides behind a menu. */
async function openMenu(editor: EditorPage): Promise<void> {
  if (await editor.menu.isVisible()) {
    await editor.menu.click();
  }
}

/** A super manager (0024): approves for the owner, until a chosen day. */
test.describe('Admin super manager', () => {
  test('should approve another manager’s request for the owner, who is told', async ({
    editor,
    page,
  }) => {
    await editor.signIn();
    await editor.openTab('Team access');
    await addManager(page, FAKE_MANAGER_ACCOUNT);
    await addManager(page, FAKE_SUPER_MANAGER_ACCOUNT, null);
    await expect(
      page.getByRole('article', { name: FAKE_SUPER_MANAGER_ACCOUNT.email }),
    ).toContainText('For good');
    await editor.signOut();
    await editor.signIn(FAKE_MANAGER_ACCOUNT);
    await sendHero(editor, page);
    await editor.signOut();

    await editor.signIn(FAKE_SUPER_MANAGER_ACCOUNT);
    await expect(page.getByRole('status').filter({ hasText: 'super manager' })).toContainText(
      'You’re a super manager: you approve changes for the owner.',
    );
    await editor.openTab('Review & publish');
    const queue = page.getByRole('region', { name: 'Waiting for your approval (1)' });
    await queue.getByRole('button', { name: 'Approve and publish' }).click();
    await expect(page.getByText('Approved and published.')).toBeVisible();
    await editor.signOut();

    await editor.signIn();
    await expect(page.getByRole('region', { name: 'History' })).toContainText(
      '1 change approved for you by a super manager since you last looked.',
    );
    await editor.openTab('Review & publish');
    await expect(page.getByRole('region', { name: 'Publish history' })).toContainText(
      `approved by ${FAKE_SUPER_MANAGER_ACCOUNT.email} for the owner, sent by ${FAKE_MANAGER_ACCOUNT.email}`,
    );
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(HEADLINE);
  });

  test('should end by itself at the end of the chosen day, without a reload', async ({
    editor,
    page,
  }) => {
    await page.clock.install({ time: LAST_DAY_NOON });
    await editor.signIn();
    await editor.openTab('Team access');
    await addManager(page, FAKE_SUPER_MANAGER_ACCOUNT, LAST_DAY);
    await expect(
      page.getByRole('article', { name: FAKE_SUPER_MANAGER_ACCOUNT.email }),
    ).toContainText('Until 30 Nov 2026');
    await editor.signOut();

    await editor.signIn(FAKE_SUPER_MANAGER_ACCOUNT);
    await expect(page.getByRole('status').filter({ hasText: 'super manager' })).toContainText(
      'Your super manager access ends on 30 Nov 2026.',
    );
    await openMenu(editor);
    await expect(editor.tabs.getByRole('link', { name: 'Leads', exact: true })).toHaveCount(1);

    await page.clock.fastForward('12:00:01');

    await expect(editor.tabs.getByRole('link', { name: 'Leads', exact: true })).toHaveCount(0);
    await expect(editor.tabs.getByRole('link', { name: 'Team access' })).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations on Team access with the switch on', async ({
    editor,
    page,
    axe,
  }) => {
    await editor.signIn();
    await editor.openTab('Team access');
    await page.getByRole('button', { name: 'Add a manager' }).click();
    await page.getByRole('checkbox', { name: /^Super manager/ }).check();
    await page.mouse.move(0, 0);

    expect((await axe().analyze()).violations).toEqual([]);
  });

  test('should have no WCAG 2.2 AA violations on a super manager’s dashboard', async ({
    editor,
    page,
    axe,
  }) => {
    await editor.signIn();
    await editor.openTab('Team access');
    await addManager(page, FAKE_SUPER_MANAGER_ACCOUNT, null);
    await editor.signOut();
    await editor.signIn(FAKE_SUPER_MANAGER_ACCOUNT);
    await page.getByRole('status').filter({ hasText: 'super manager' }).waitFor();
    await page.mouse.move(0, 0);

    expect((await axe().analyze()).violations).toEqual([]);
  });
});
