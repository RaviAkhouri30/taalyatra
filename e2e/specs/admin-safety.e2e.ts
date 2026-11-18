import fakeDb from '../../src/app/core/backends/fake/fake-db.json';
import { expect, test } from '../fixtures/test';

/** A backup file as the editor writes it, holding one changed Hero. */
function backupFile(title: string): { name: string; mimeType: string; buffer: Buffer } {
  const backup = {
    format: 1,
    site: 'taal-yatra',
    version: '1.11.0',
    createdAt: '2026-11-01T05:00:00.000Z',
    documents: { 'home/hero': { title } },
  };
  return {
    name: 'taal-yatra-backup-2026-11-01.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  };
}

/** Nothing lost, and what's new (0016): backups, going back, the safety copy, release notes. */
test.describe('Admin safety and what’s new', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should mark What’s new until it is opened, and list the releases', async ({
    editor,
    page,
  }) => {
    if (await editor.menu.isVisible()) {
      await editor.menu.click();
    }
    const link = editor.tabs.getByRole('link', { name: /^What’s new/ });
    await expect(link).toContainText('New');

    // The menu is already open on phones and tablets: follow the link from there.
    await link.click();

    await expect(editor.heading).toHaveText('What’s new');
    await expect(page.getByText('This version')).toBeVisible();
    if (await editor.menu.isVisible()) {
      await editor.menu.click();
    }
    await expect(link).not.toContainText('New');
  });

  test('should offer a backup after publishing, and download it', async ({ editor, page }) => {
    await editor.openTab('Hero');
    await editor.card('Hero').getByLabel('Headline, first line').fill('Drum with us.');
    await editor.waitForSave();
    await page.goto('/admin');
    await editor.publish();
    const backups = page.getByRole('region', { name: 'Backups' });
    await expect(backups).toContainText('Download a backup to keep a copy');

    const download = page.waitForEvent('download');
    await backups.getByRole('button', { name: 'Download a backup' }).click();

    expect((await download).suggestedFilename()).toMatch(
      /^taal-yatra-backup-\d{4}-\d{2}-\d{2}\.json$/,
    );
    await expect(backups).toContainText('Last backup:');
    await expect(
      backups.getByRole('button', { name: /^Restore this browser’s copy/ }),
    ).toBeVisible();
  });

  test('should restore a backup file into the draft, for review first', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Review & publish');
    const backups = page.getByRole('region', { name: 'Backups' });

    await backups.getByTestId('backup-file').setInputFiles(backupFile('From the backup'));
    await expect(backups).toContainText('Put the backup from 1 Nov 2026');
    await backups.getByRole('button', { name: 'Yes, restore it' }).click();

    await expect(
      page.getByRole('region', { name: 'Changes not on the website yet' }),
    ).toContainText('Hero');
  });

  test('should refuse a file that is not a backup, and change nothing', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Review & publish');
    const backups = page.getByRole('region', { name: 'Backups' });

    await backups.getByTestId('backup-file').setInputFiles({
      name: 'notes.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"hello":"world"}'),
    });

    await expect(backups.getByRole('alert')).toHaveText('This file isn’t a Taal Yatra backup.');
    await expect(page.getByText('Everything is published.')).toBeVisible();
  });

  test('should warn before going back past later publishes', async ({ editor, page }) => {
    for (const headline of ['First change.', 'Second change.']) {
      await editor.openTab('Hero');
      await editor.card('Hero').getByLabel('Headline, first line').fill(headline);
      await editor.waitForSave();
      await editor.publish();
    }
    const history = page.getByRole('region', { name: 'Publish history' });
    // The first publish's toast can still be showing: wait for the second publish itself.
    await expect(history.getByRole('listitem')).toHaveCount(2);

    await history
      .getByRole('button', { name: /^Go back to before the publish of/ })
      .last()
      .click();
    await expect(history).toContainText('Anything published after it will be replaced too');
    await history.getByRole('button', { name: 'Go back', exact: true }).click();

    await expect(
      page.getByRole('region', { name: 'Changes not on the website yet' }),
    ).toContainText('Hero');
  });

  test('should offer back a change that was never saved', async ({ editor, page }) => {
    // A change that never reached the draft (offline, or the tab closed before the save): only
    // its copy on this device has it. The fake store saves too fast to leave one behind.
    const typed = { ...fakeDb.home.hero, title: 'Typed, then the tab closed.' };
    await page.evaluate(
      (copy) => {
        localStorage.setItem('taal-yatra.admin.unsaved.home/hero', JSON.stringify(copy));
      },
      { content: typed, savedAt: '2026-11-18T05:12:00.000Z' },
    );

    await editor.openTab('Hero');
    await expect(page.getByRole('group', { name: /weren’t saved\.$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Restore them' }).click();

    await expect(editor.card('Hero').getByLabel('Headline, first line')).toHaveValue(
      'Typed, then the tab closed.',
    );
    await expect(page.getByRole('group', { name: /weren’t saved\.$/ })).toHaveCount(0);
  });

  test('should have no WCAG 2.2 AA violations on What’s new and Review & publish', async ({
    editor,
    axe,
  }) => {
    for (const tab of ['What’s new', 'Review & publish']) {
      await editor.openTab(tab);
      const results = await axe().exclude('iframe').analyze();
      expect(results.violations).toEqual([]);
    }
  });
});
