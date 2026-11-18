import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserFileService } from './browser-file.service';

describe('BrowserFileService', () => {
  function create(): BrowserFileService {
    return TestBed.runInInjectionContext(() => new BrowserFileService());
  }

  it('should download the text through a temporary link, then let the address go', async () => {
    vi.useFakeTimers();
    const created = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup');
    const revoked = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const link = TestBed.inject(DOCUMENT).createElement('a');
    const click = vi.spyOn(link, 'click').mockImplementation(() => undefined);
    vi.spyOn(TestBed.inject(DOCUMENT), 'createElement').mockReturnValue(link);

    create().download('backup.json', '{"a":1}', 'application/json');

    const blob = created.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toBe('{"a":1}');
    expect(blob.type).toBe('application/json');
    expect(link.download).toBe('backup.json');
    expect(click).toHaveBeenCalledOnce();
    expect(revoked).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoked).toHaveBeenCalledWith('blob:backup');
    vi.useRealTimers();
  });

  it('should read a chosen file’s text, only when subscribed', async () => {
    const file = new Blob(['hello']);
    const text = vi.spyOn(file, 'text');
    const read = create().read(file);

    expect(text).not.toHaveBeenCalled();
    await expect(firstValueFrom(read)).resolves.toBe('hello');
  });
});
