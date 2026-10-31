import { expect, test } from '../fixtures/test';

/** Editor views, by tab-bar link and page heading. */
const VIEWS = [
  'Dashboard',
  'Offer & theme',
  'Page content',
  'Sections & pages',
  'Contact & links',
  'Review & publish',
];

test.describe('Admin editor', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should save an edit as a draft, preview it, publish it, and show it on the site', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Page content');
    await editor.card('Hero').getByLabel('Headline, first line').fill('Drum with us.');
    await editor.waitForSave();

    // The preview reloads the whole site after the save, which takes longer under a parallel run.
    await expect(editor.preview.getByRole('heading', { level: 1 })).toContainText('Drum with us.', {
      timeout: 15_000,
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Drum with us.');

    await page.goto('/admin');
    await editor.publish();
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Drum with us.');
  });

  test('should hide a switched-off section and its menu links once published', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Sections & pages');
    await page.getByRole('switch', { name: 'Gallery' }).uncheck();
    await editor.waitForSave();
    await editor.publish();

    await page.goto('/');

    await expect(page.locator('app-home-hero')).toBeVisible();
    await expect(page.locator('#gallery')).toHaveCount(0);
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Gallery' })).toHaveCount(
      0,
    );
  });

  test('should send visitors home from a switched-off page', async ({ editor, page }) => {
    await editor.openTab('Sections & pages');
    await page.getByRole('switch', { name: 'Team page' }).uncheck();
    await editor.waitForSave();
    await editor.publish();

    await page.goto('/team');

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Team', exact: true }),
    ).toHaveCount(0);
  });

  test('should hide an offer whose last day has passed, after warning about it', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Offer & theme');
    await editor.card('Offer switch and dates').getByLabel('Ends on').fill('2020-01-02');
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByText('This offer has ended, so visitors won’t see it.')).toBeVisible();
    await editor.publish();
    await page.goto('/');

    await expect(page.locator('#diwali')).toHaveCount(0);
    await expect(page.locator('app-promo-badge')).toHaveCount(0);
  });

  test('should block publishing while a required field is empty', async ({ editor, page }) => {
    await editor.openTab('Contact & links');
    const email = editor.card('Contact details').getByLabel('Email');
    await email.fill('');

    await expect(editor.card('Contact details').getByText('Fill this in.')).toBeVisible();
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByText('Contact details · Email:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish changes' })).toBeDisabled();
  });

  test('should throw a draft away', async ({ editor, page }) => {
    await editor.openTab('Page content');
    await editor.card('Team').getByLabel('Title', { exact: true }).fill('Our people.');
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await page.getByRole('button', { name: 'Discard the draft of Team' }).click();

    await expect(page.getByText('Everything is published.')).toBeVisible();
  });

  test('should put the version from before a publish back into the draft', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Page content');
    await editor.card('Videos').getByLabel('Title', { exact: true }).fill('Watch us play.');
    await editor.waitForSave();
    await editor.publish();

    await page.getByRole('button', { name: /^Undo the publish of/ }).click();
    await page.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByText('That version is back in your draft.')).toBeVisible();
    await editor.openTab('Page content');

    await expect(editor.card('Videos').getByLabel('Title', { exact: true })).toHaveValue(
      'See a circle in action.',
    );
  });

  for (const view of VIEWS) {
    test(`should have no WCAG 2.2 AA violations on ${view}`, async ({ editor, axe }) => {
      await editor.openTab(view);

      // The preview frame is the public site, which has its own scans.
      const results = await axe().exclude('iframe').analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('should match the approved look of the dashboard', async ({ editor, page }) => {
    await page.evaluate(async () => document.fonts.ready);

    await expect(page.locator('app-dashboard')).toHaveScreenshot('dashboard.png', {
      stylePath: 'e2e/support/visual.css',
    });
    await expect(editor.heading).toHaveText('Welcome back');
  });
});
