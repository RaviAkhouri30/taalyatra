import { expect, test } from '../fixtures/test';

/** The editor pages 2.12.0 adds to or extends, each with a card to wait for (0028). */
const PAGES: readonly (readonly [page: string, card: string])[] = [
  ['Chat assistant', 'Answers'],
  ['Proposal form', 'Choices'],
];

/** The chat's script and the proposal form, editable since 2.12.0 (0028), with the Fake backend. */
test.describe('Admin chat assistant and proposal form', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should publish a changed answer and give it in the chat', async ({ editor, home }) => {
    await editor.openTab('Chat assistant');
    // The second answer is the one for family events.
    const answer = editor.card('Answers').getByRole('group', { name: 'Answer 2', exact: true });
    await answer.getByLabel('Answer', { exact: true }).fill('Yes! Birthdays are our favourite.');
    await editor.waitForSave();

    await editor.publish();
    await home.open();
    await home.chatToggle.click();
    await home.chatPanel.getByRole('button', { name: 'Family events?' }).click();

    await expect(home.chatPanel.getByRole('log')).toContainText('Birthdays are our favourite.');
  });

  test('should start the event types on the chosen one', async ({ editor, home }) => {
    await editor.openTab('Proposal form');
    const starts = editor.card('Choices').getByRole('group', { name: 'Each list starts on' });
    await starts.getByLabel('Event type', { exact: true }).fill('School or college');
    await editor.waitForSave();

    await editor.publish();
    await home.open('contact');

    await expect(home.contactSection.getByRole('combobox', { name: 'Event type' })).toHaveValue(
      'School or college',
    );
  });

  test('should block publishing a list that starts on a choice it doesn’t have', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Proposal form');
    const starts = editor.card('Choices').getByRole('group', { name: 'Each list starts on' });
    await starts.getByLabel('Event type', { exact: true }).fill('Corporate');
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByText('“Corporate” isn’t one of the choices.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish changes' })).toBeDisabled();
  });

  for (const [name, card] of PAGES) {
    test(`should have no WCAG 2.2 AA violations on ${name}`, async ({ editor, page, axe }) => {
      await editor.openTab(name);
      await editor.card(card, { exact: true }).waitFor();
      await page.mouse.move(0, 0);

      expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
    });
  }
});
