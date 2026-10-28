import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserClipboardService } from './browser-clipboard.service';

describe('BrowserClipboardService', () => {
  function create(clipboard: unknown): BrowserClipboardService {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { navigator: { clipboard } } } }],
    });
    return TestBed.runInInjectionContext(() => new BrowserClipboardService());
  }

  it('should write the text lazily, only when subscribed', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const copy = create({ writeText }).copy('Kharadi, Pune');

    expect(writeText).not.toHaveBeenCalled();
    await firstValueFrom(copy);
    expect(writeText).toHaveBeenCalledWith('Kharadi, Pune');
  });

  it('should fail when the browser refuses', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));

    await expect(firstValueFrom(create({ writeText }).copy('x'))).rejects.toThrow('denied');
  });

  it('should fail when the Clipboard API is unavailable', async () => {
    await expect(firstValueFrom(create(undefined).copy('x'))).rejects.toThrow('unavailable');
  });
});
