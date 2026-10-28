import { firstValueFrom } from 'rxjs';
import { FakeClipboardService } from './fake-clipboard.service';

describe('FakeClipboardService', () => {
  it('should record each copied text and succeed', async () => {
    const clipboard = new FakeClipboardService();

    await firstValueFrom(clipboard.copy('one'));

    expect(clipboard.copied).toEqual(['one']);
  });
});
