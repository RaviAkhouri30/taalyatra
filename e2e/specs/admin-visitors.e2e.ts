import { type Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';

/** Where the offline database keeps written documents (FAKE_OVERLAY_STORAGE_KEY). */
const FAKE_OVERLAY_STORAGE_KEY = 'taal-yatra.fake-db.overlay';

/** Today in Pune, as the admin area counts days. */
function siteDay(offsetDays = 0): string {
  const day = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(day);
}

const seconds = (offsetDays: number): number =>
  Math.floor((Date.now() + offsetDays * 86_400_000) / 1000);

/** Leads and visits as Firestore would hold them; the seed file has none, so the live site never gets these. */
const SAMPLE = [
  [
    'proposals/e2e-asha',
    {
      name: 'Asha Rao',
      phone: '98200 12345',
      email: 'asha@example.com',
      eventType: 'Corporate',
      groupSize: '50–100',
      message: 'A drum circle for our offsite.',
      createdAt: { seconds: seconds(-1) },
    },
  ],
  [
    'proposals/e2e-ravi',
    {
      name: 'Ravi Kumar',
      phone: '91234 56789',
      email: 'ravi@example.com',
      eventType: 'Wedding',
      groupSize: '10–50',
      createdAt: { seconds: seconds(-3) },
    },
  ],
  [
    `visitDays/${siteDay(-1)}`,
    { total: 12, pages: { '/': 9, '/shows': 3 }, devices: { phone: 8, desktop: 4 } },
  ],
] as const;

/** Adds the sample to the offline database, then reloads so the editor reads it. */
async function seed(page: Page): Promise<void> {
  await page.evaluate(
    ({ key, entries }) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      localStorage.setItem(key, JSON.stringify([...saved, ...entries]));
    },
    { key: FAKE_OVERLAY_STORAGE_KEY, entries: SAMPLE },
  );
  await page.goto('/admin');
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
}

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
