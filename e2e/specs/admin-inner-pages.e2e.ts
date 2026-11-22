import { expect, test } from '../fixtures/test';

/** The editor pages new in 2.11.0, each with a card to wait for (0028). */
const NEW_PAGES: readonly (readonly [page: string, card: string])[] = [
  ['Achievements', 'Page heading and numbers'],
  ['Search and sharing', 'Search and sharing'],
];

/** The inner pages and search titles made editable in 2.11.0 (0028), with the Fake backend. */
test.describe('Admin inner pages and search titles', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should preview the Team page while its heading changes, then publish it', async ({
    editor,
    innerPages,
  }) => {
    await editor.openTab('Team');
    const heading = editor.card('Team page').getByRole('group', { name: 'Page heading' });
    await heading.getByLabel('Title, first part', { exact: true }).fill('Meet the drummers');
    await editor.waitForSave();

    await expect(editor.preview.getByRole('heading', { level: 1 })).toContainText(
      'Meet the drummers',
    );
    await editor.publish();
    await innerPages.team.open();

    await expect(innerPages.team.heading).toContainText('Meet the drummers');
  });

  test('should give the Videos page its own title and search description', async ({
    editor,
    innerPages,
  }) => {
    await editor.openTab('Search and sharing');
    const videos = editor.card('Search and sharing').getByRole('group', { name: 'Videos page' });
    await videos.getByLabel('Title', { exact: true }).fill('Drum circle videos from Pune');
    await videos.getByLabel('Search description').fill('Watch our drum circles in action.');
    await editor.waitForSave();

    await editor.publish();
    await innerPages.videos.open();

    await expect(innerPages.videos.page).toHaveTitle('Drum circle videos from Pune');
    await expect(innerPages.videos.page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Watch our drum circles in action.',
    );
  });

  test('should change a milestone on the Achievements page', async ({ editor, innerPages }) => {
    await editor.openTab('Achievements');
    const milestone = editor.card('Milestones').getByRole('group', { name: 'Milestone 1' });
    await milestone.getByLabel('Title', { exact: true }).fill('Our first drum circle');
    await editor.waitForSave();

    await editor.publish();
    await innerPages.achievements.open();

    await expect(innerPages.achievements.page.getByRole('main')).toContainText(
      'Our first drum circle',
    );
  });

  for (const [name, card] of NEW_PAGES) {
    test(`should have no WCAG 2.2 AA violations on ${name}`, async ({ editor, page, axe }) => {
      await editor.openTab(name);
      await editor.card(card, { exact: true }).waitFor();
      await page.mouse.move(0, 0);

      expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
    });
  }
});
