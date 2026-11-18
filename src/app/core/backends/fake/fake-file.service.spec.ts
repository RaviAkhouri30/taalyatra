import { firstValueFrom } from 'rxjs';
import { FakeFileService } from './fake-file.service';

describe('FakeFileService', () => {
  it('should remember downloads instead of saving them', () => {
    const files = new FakeFileService();

    files.download('a.json', '{}', 'application/json');

    expect(files.downloads).toEqual([{ name: 'a.json', text: '{}', type: 'application/json' }]);
  });

  it('should read whatever the spec says a file holds', async () => {
    const files = new FakeFileService();
    files.text = 'backup';

    await expect(firstValueFrom(files.read(new Blob()))).resolves.toBe('backup');
  });
});
