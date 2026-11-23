import { expect, test } from '../fixtures/test';

const QUESTION = 'Does anyone need musical experience?';

/** Hiding one item (0028 D4, 2.15.0), with the Fake backend. */
test.describe('Admin hidden items', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should take a video off the site, marked Hidden in the editor', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Videos');
    const videos = editor.card('Videos');
    await videos.getByRole('button', { name: /^\[Video title 1\]/ }).click();
    const first = videos.getByRole('group', { name: 'Video 1', exact: true });

    await first.getByRole('switch', { name: 'Hidden' }).check();
    await editor.waitForSave();

    await expect(first.getByText('Hidden', { exact: true }).first()).toBeVisible();
    await expect(videos.locator('.lo-hidden')).toHaveText('Hidden');
    await editor.publish();
    await page.goto('/videos');
    await expect(page.getByRole('main')).toContainText('[Video title 2]');
    await expect(page.getByRole('main')).not.toContainText('[Video title 1]');
  });

  test('should hide a question, then show it again', async ({ editor, home, page }) => {
    await editor.openTab('FAQ');
    const question = editor.card('Questions and answers').getByRole('group', {
      name: 'Question 1',
      exact: true,
    });
    await question.getByRole('switch', { name: 'Hidden' }).check();
    await editor.waitForSave();
    await editor.publish();
    await home.open('faq');
    await expect(home.section('faq')).not.toContainText(QUESTION);

    // Back from the site to the admin's FAQ page.
    await page.goto('/admin/faq');
    await question.getByRole('switch', { name: 'Hidden' }).uncheck();
    await editor.waitForSave();
    await editor.publish();
    await home.open('faq');

    await expect(home.section('faq')).toContainText(QUESTION);
  });

  test('should have no WCAG 2.2 AA violations with a hidden item', async ({
    editor,
    page,
    axe,
  }) => {
    await editor.openTab('FAQ');
    const question = editor.card('Questions and answers').getByRole('group', {
      name: 'Question 1',
      exact: true,
    });
    await question.getByRole('switch', { name: 'Hidden' }).check();
    await expect(question.getByText('Hidden', { exact: true }).first()).toBeVisible();
    await page.mouse.move(0, 0);

    expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
  });
});
