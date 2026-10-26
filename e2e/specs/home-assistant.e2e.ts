import { expect, test } from '../fixtures/test';

test.describe('Home chat assistant', () => {
  test('should answer quick and typed questions', async ({ home }) => {
    await home.open();
    const panel = home.chatPanel;
    const conversation = panel.getByRole('log');

    await home.chatToggle.click();
    await expect(home.chatToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: 'Family events?' }).click();
    await expect(conversation).toContainText('we love family functions');

    await panel.getByRole('textbox', { name: 'Your question' }).fill('How long is a session?');
    await panel.getByRole('button', { name: 'Send message' }).click();
    await expect(conversation).toContainText('Sessions run 20 to 60 minutes.');
    await expect(panel.getByRole('textbox', { name: 'Your question' })).toHaveValue('');
  });

  test('should close with Escape and return focus to the launcher', async ({ home }) => {
    await home.open();
    await home.chatToggle.click();
    await expect(home.chatPanel).toBeVisible();

    await home.page.keyboard.press('Escape');

    await expect(home.chatPanel).toBeHidden();
    await expect(home.chatToggle).toBeFocused();
  });
});
