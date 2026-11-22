import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { FakeFileService } from '@core/backends/fake/fake-file.service';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IFileService } from '@core/interfaces/i-file-service';
import { DeviceStoreService } from './device-store.service';
import { CHANGELOG_TEXT } from '@core/tokens/changelog.token';
import { CLOCK } from '@core/tokens/clock.token';
import { type IBackup } from '../models/backup-file';
import { BROWSER_BACKUP_KEY, BROWSER_BACKUP_MAX_CHARS } from '../models/editor-storage.constants';
import { provideSignedIn } from '../testing/editor-testing';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { SAVED_THEME_DOCUMENT, SAVED_THEME_PATH } from '../testing/saved-theme.fixture';
import { BackupService } from './backup.service';

const NOW = new Date('2026-11-18T05:12:00.000Z');
const PHOTO = 'media/0f8fad5b-d9cb-469f-a165-70867728950e';
const GONE = 'media/1f8fad5b-d9cb-469f-a165-70867728950e';

describe('BackupService', () => {
  function setUp(seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = {}) {
    const store = new MemoryDocumentStore(seed);
    const files = new FakeFileService();
    const kept = new Map<string, string>();
    const localStore = {
      get: (key: string) => kept.get(key) ?? null,
      set: vi.fn((key: string, value: string) => kept.set(key, value).has(key)),
      remove: (key: string) => kept.delete(key),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        ...provideSignedIn(),
        { provide: IFileService, useValue: files },
        { provide: DeviceStoreService, useValue: localStore },
        BackupService,
        { provide: CLOCK, useValue: { now: () => NOW } },
        { provide: CHANGELOG_TEXT, useValue: '## [1.12.0] - 2026-11-18\n### Added\n- Backups.' },
      ],
    });
    return { service: TestBed.inject(BackupService), store, files, kept, localStore };
  }

  describe('making one', () => {
    it('should download every published document and library entry, but no drafts', async () => {
      const { service, files } = setUp({
        'home/hero': { title: 'Live' },
        'drafts/home__hero': { path: 'home/hero', content: { title: 'Draft' }, savedAt: 'x' },
        'team/001': { name: 'Asha', order: 1 },
        [PHOTO]: { name: 'a.jpg' },
      });

      await firstValueFrom(service.make());

      const [file] = files.downloads;
      const backup = JSON.parse(file?.text ?? '') as IBackup;
      expect(file?.name).toBe('taal-yatra-backup-2026-11-18.json');
      expect(file?.type).toBe('application/json');
      expect(backup).toMatchObject({ format: 1, site: 'taal-yatra', version: '1.12.0' });
      expect(backup.documents['home/hero']).toEqual({ title: 'Live' });
      expect(backup.documents['team']).toEqual({ _items: [{ name: 'Asha' }] });
      expect(backup.documents[PHOTO]).toEqual({ name: 'a.jpg' });
      expect(Object.keys(backup.documents)).not.toContain('home/offer');
    });

    it('should hold the saved themes (0027 D6)', async () => {
      const { service, files } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });

      await firstValueFrom(service.make());

      const backup = JSON.parse(files.downloads[0]?.text ?? '') as IBackup;
      expect(backup.documents[SAVED_THEME_PATH]).toEqual(SAVED_THEME_DOCUMENT);
    });

    it('should keep a copy in this browser and record the date for every device', async () => {
      const { service, store } = setUp({ 'home/hero': { title: 'Live' } });

      const made = await firstValueFrom(service.make());

      expect(made).toEqual({ createdAt: NOW.toISOString(), keptInBrowser: true, withLeads: false });
      expect(service.browserCopy()?.documents['home/hero']).toEqual({ title: 'Live' });
      expect(store.documents.get('adminState/backups')).toEqual({ lastAt: NOW.toISOString() });
      await expect(firstValueFrom(service.lastMade())).resolves.toBe(NOW.toISOString());
    });

    it('should leave the leads out unless asked', async () => {
      const { service, files } = setUp({ 'proposals/a': { name: 'Asha' } });

      await firstValueFrom(service.make());

      expect(files.downloads[0]?.text).not.toContain('Asha');
    });

    it('should add the leads when asked, readable, and only download that file', async () => {
      const { service, files, kept } = setUp({
        'proposals/a': { name: 'Asha', createdAt: { seconds: 1_793_000_000 } },
      });

      const made = await firstValueFrom(service.make(true));

      const backup = JSON.parse(files.downloads[0]?.text ?? '{}') as {
        documents: Record<string, unknown>;
      };
      expect(made).toMatchObject({ keptInBrowser: false, withLeads: true });
      expect(backup.documents['proposals/a']).toEqual({
        name: 'Asha',
        createdAt: new Date(1_793_000_000_000).toISOString(),
      });
      expect(kept.size).toBe(0);
    });

    it('should only download a backup too big for the browser, dropping the older copy', async () => {
      const { service, kept } = setUp({
        'home/hero': { text: 'x'.repeat(BROWSER_BACKUP_MAX_CHARS) },
      });
      kept.set(BROWSER_BACKUP_KEY, 'an older backup');

      const made = await firstValueFrom(service.make());

      expect(made.keptInBrowser).toBe(false);
      expect(kept.has(BROWSER_BACKUP_KEY)).toBe(false);
    });

    it('should still finish when the date can’t be recorded, since the file is saved', async () => {
      const { service, store, files } = setUp();
      vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('offline')));

      await expect(firstValueFrom(service.make())).resolves.toMatchObject({ keptInBrowser: true });
      expect(files.downloads).toHaveLength(1);
    });
  });

  describe('restoring one', () => {
    const backup: IBackup = {
      format: 1,
      site: 'taal-yatra',
      version: '1.11.0',
      createdAt: '2026-11-01T00:00:00.000Z',
      documents: {
        'home/hero': { title: 'From the backup' },
        [PHOTO]: { name: 'a.jpg', description: 'Restored' },
        [GONE]: { name: 'b.jpg' },
      },
    };

    it('should put the content into drafts, never straight onto the site', async () => {
      const { service, store } = setUp({ 'home/hero': { title: 'Live' } });

      await firstValueFrom(service.restore(backup));

      expect(store.documents.get('home/hero')).toEqual({ title: 'Live' });
      expect(store.documents.get('drafts/home__hero')).toMatchObject({
        path: 'home/hero',
        content: { title: 'From the backup' },
      });
    });

    it('should restore descriptions of photos still in the library, and skip deleted ones', async () => {
      const { service, store } = setUp({ [PHOTO]: { name: 'a.jpg', description: 'Changed' } });

      await firstValueFrom(service.restore(backup));

      expect(store.documents.get(PHOTO)).toEqual({ name: 'a.jpg', description: 'Restored' });
      expect(store.documents.has(GONE)).toBe(false);
    });

    it('should not write to the library when none of its photos are left', async () => {
      const { service, store } = setUp();

      await firstValueFrom(service.restore(backup));

      expect(store.commits).toHaveLength(1);
    });
  });

  describe('restoring saved themes (0027 D6)', () => {
    const NEWER = 'savedThemes/2f8fad5b-d9cb-469f-a165-70867728950e';
    const withThemes = (documents: IBackup['documents']): IBackup => ({
      format: 1,
      site: 'taal-yatra',
      version: '2.9.0',
      createdAt: '2026-11-22T00:00:00.000Z',
      documents,
    });

    it('should put them back and keep any saved since', async () => {
      const { service, store } = setUp({
        [SAVED_THEME_PATH]: { ...SAVED_THEME_DOCUMENT, name: 'Renamed since' },
        [NEWER]: { ...SAVED_THEME_DOCUMENT, name: 'Newer' },
      });

      await firstValueFrom(
        service.restore(withThemes({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT })),
      );

      expect(store.documents.get(SAVED_THEME_PATH)).toEqual(SAVED_THEME_DOCUMENT);
      expect(store.documents.get(NEWER)).toMatchObject({ name: 'Newer' });
    });

    it('should leave out one that isn’t a saved theme', async () => {
      const { service, store } = setUp();

      await firstValueFrom(
        service.restore(withThemes({ [SAVED_THEME_PATH]: { ...SAVED_THEME_DOCUMENT, name: '' } })),
      );

      expect(store.documents.has(SAVED_THEME_PATH)).toBe(false);
    });
  });

  it('should have no browser copy, or no date, before the first backup', async () => {
    const { service } = setUp();

    expect(service.browserCopy()).toBeNull();
    await expect(firstValueFrom(service.lastMade())).resolves.toBeNull();
  });
});
