import { expect, test } from '../fixtures/test';
import { seedVisitorData as seed } from '../fixtures/visitor-data';

/** Visits and leads (0018). */
test.describe('Admin visits and leads', () => {
  test.beforeEach(async ({ editor, page }) => {
    await editor.signIn();
    await seed(page);
  });

  test('should show new leads on the dashboard and in the menu', async ({ editor, page }) => {
    await expect(page.getByRole('region', { name: /^Leads/ })).toContainText('2 leads are new');
    if (await editor.menu.isVisible()) {
      await editor.menu.click();
    }
    await expect(editor.tabs.getByRole('link', { name: /^Leads/ })).toContainText('2 new');
  });

  test('should filter the leads, mark one, and export them', async ({ editor, page }) => {
    await editor.openTab('Leads');
    const asha = page.getByRole('article', { name: 'Asha Rao' });
    await expect(page.getByRole('article')).toHaveCount(2);

    await page.getByRole('searchbox', { name: 'Search' }).fill('ravi');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('status').filter({ hasText: 'Showing' })).toHaveText(
      'Showing 1 of 2 leads',
    );
    await page.getByRole('button', { name: 'Show all' }).click();

    await asha.getByLabel('Status').selectOption('contacted');
    await expect(asha.getByLabel('Status')).toHaveValue('contacted');

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    expect((await download).suggestedFilename()).toMatch(
      /^taal-yatra-leads-\d{4}-\d{2}-\d{2}\.csv$/,
    );
  });

  test('should remove a lead only after a warning', async ({ editor, page }) => {
    await editor.openTab('Leads');
    const ravi = page.getByRole('article', { name: 'Ravi Kumar' });

    await ravi.getByRole('button', { name: 'Remove' }).click();
    await expect(ravi.getByRole('group')).toContainText('details for good');
    await ravi.getByRole('button', { name: 'Yes, remove' }).click();

    await expect(page.getByRole('article')).toHaveCount(1);
  });

  test('should graph visits and proposals, by day or by month', async ({ editor, page }) => {
    await editor.openTab('Visits');

    await expect(page.getByRole('figure', { name: 'Visits' })).toContainText('12 visits');
    await expect(page.getByRole('figure', { name: 'Proposals' })).toContainText('2 proposals');
    await expect(page.getByRole('region', { name: 'Where visitors arrive' })).toContainText(
      'Home page',
    );

    const byMonth = page.getByRole('button', { name: 'By month' });
    await byMonth.click();
    await expect(byMonth).toHaveAttribute('aria-pressed', 'true');
  });

  test('should warn that a backup with leads holds personal details', async ({ editor, page }) => {
    await editor.openTab('Review & publish');
    const backups = page.getByRole('region', { name: 'Backups' });

    await backups.getByRole('checkbox', { name: 'Include leads' }).check();
    await expect(backups).toContainText('Keep it somewhere safe');

    const download = page.waitForEvent('download');
    await backups.getByRole('button', { name: 'Download a backup' }).click();
    expect((await download).suggestedFilename()).toMatch(/^taal-yatra-backup-/);
  });

  test('should have no WCAG 2.2 AA violations on Visits and Leads', async ({
    editor,
    axe,
    page,
  }) => {
    for (const tab of ['Visits', 'Leads']) {
      await editor.openTab(tab);
      // Outlined buttons fade in from the solid style as they first draw; scan the settled look.
      for (const button of await page.locator('.btn--ghost').all()) {
        await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      const results = await axe().exclude('iframe').analyze();
      expect(results.violations).toEqual([]);
    }
  });
});
