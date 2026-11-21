import {
  FAKE_CHAT_FAIL,
  FAKE_CHAT_PREFIX,
} from '../../src/app/core/backends/fake/fake-ai.constants';
import { expect, test } from '../fixtures/test';

test.describe('Home chat assistant', () => {
  test('should answer a quick reply from the script, and a typed question from the AI', async ({
    home,
  }) => {
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
    // The Fake AI chat (0025 V7) answers typed questions; the note says so.
    await expect(conversation).toContainText(`${FAKE_CHAT_PREFIX} How long is a session?`);
    await expect(panel.getByRole('textbox', { name: 'Your question' })).toHaveValue('');
    await expect(panel).toContainText('Please don’t share personal details here.');
  });

  test('should answer from the script when the AI can’t', async ({ home }) => {
    await home.open();
    const panel = home.chatPanel;
    await home.chatToggle.click();

    await panel
      .getByRole('textbox', { name: 'Your question' })
      .fill(`How long is a session? ${FAKE_CHAT_FAIL}`);
    await panel.getByRole('button', { name: 'Send message' }).click();

    await expect(panel.getByRole('log')).toContainText('Sessions run 20 to 60 minutes.');
    await expect(panel.getByRole('log')).not.toContainText(FAKE_CHAT_PREFIX);
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
