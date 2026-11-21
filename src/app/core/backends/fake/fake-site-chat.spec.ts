import { firstValueFrom } from 'rxjs';
import { FAKE_CHAT_FAIL, FAKE_CHAT_PREFIX } from './fake-ai.constants';
import { FakeSiteChat } from './fake-site-chat';

describe('FakeSiteChat', () => {
  it('should answer predictably', async () => {
    await expect(firstValueFrom(new FakeSiteChat(0).ask('How long?', []))).resolves.toBe(
      `${FAKE_CHAT_PREFIX} How long?`,
    );
  });

  it('should fail when asked to, so e2e can show the script answering', async () => {
    await expect(
      firstValueFrom(new FakeSiteChat(0).ask(`Please ${FAKE_CHAT_FAIL}`, [])),
    ).rejects.toBeDefined();
  });
});
