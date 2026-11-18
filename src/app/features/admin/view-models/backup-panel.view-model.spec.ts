import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { IFileService } from '@core/interfaces/i-file-service';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { BACKUP_PROBLEMS, type IBackup } from '../models/backup-file';
import { BROWSER_BACKUP_KEY } from '../models/editor-storage.constants';
import { BackupService } from '../services/backup.service';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
import { BACKUP_MESSAGES } from './backup-download';
import { BackupPanelViewModel, RESTORE_MESSAGES } from './backup-panel.view-model';

const BACKUP: IBackup = {
  format: 1,
  site: 'taal-yatra',
  version: '1.11.0',
  createdAt: '2026-10-30T10:00:00.000Z',
  documents: { 'home/hero': { title: 'From the backup' } },
};

describe('BackupPanelViewModel', () => {
  function setUp(seed: Parameters<typeof provideEditorTesting>[0] = {}) {
    const testing = provideEditorTesting(seed);
    const layout = layoutStub();
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layout),
        { provide: ToastService, useValue: { show } },
        BackupPanelViewModel,
      ],
    });
    const model = TestBed.inject(BackupPanelViewModel);
    model.init().subscribe();
    return { model, layout, show, ...testing };
  }

  it('should say there is no backup yet, with no browser copy to offer', () => {
    const { model } = setUp();

    expect(model.data()?.status.due).toBe(true);
    expect(model.data()?.browserCopyWhen).toBeNull();
  });

  it('should still show the card when the date can’t be read', () => {
    vi.spyOn(BackupService.prototype, 'lastMade').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    const { model } = setUp();

    expect(model.data()?.status.lastAt).toBeNull();
  });

  it('should download a backup, then show its date and the browser copy', () => {
    const { model, files, show } = setUp({ 'home/hero': { title: 'Live' } });

    model.download();

    expect(files.downloads).toHaveLength(1);
    expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.kept);
    expect(model.data()?.status.due).toBe(false);
    expect(model.data()?.browserCopyWhen).toBe('31 Oct 2026, 3:30 pm');
    expect(model.busy()).toBe(false);
  });

  it('should ask before restoring a chosen file, then put it in the draft', () => {
    const { model, files, store, layout, show } = setUp();
    files.text = JSON.stringify(BACKUP);

    model.chooseFile(new Blob());
    expect(model.pending()?.when).toBe('30 Oct 2026, 3:30 pm');
    model.confirmRestore();

    expect(store.documents.get('drafts/home__hero')).toMatchObject({
      content: { title: 'From the backup' },
    });
    expect(model.pending()).toBeNull();
    expect(show).toHaveBeenCalledWith(RESTORE_MESSAGES.restored);
    expect(layout.refreshChanges).toHaveBeenCalled();
  });

  it('should refuse a file that isn’t a backup, saying why, and change nothing', () => {
    const { model, files, store } = setUp();
    files.text = '{"site":"other","format":1}';

    model.chooseFile(new Blob());

    expect(model.problem()).toBe(BACKUP_PROBLEMS.notOurs);
    expect(model.pending()).toBeNull();
    expect(store.commits).toEqual([]);
  });

  it('should say so when the file can’t be read at all', () => {
    const { model } = setUp();
    vi.spyOn(TestBed.inject(IFileService), 'read').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    model.chooseFile(new Blob());

    expect(model.problem()).toBe(BACKUP_PROBLEMS.unreadable);
  });

  it('should restore this browser’s copy, or say there is none', () => {
    const { model, localStore, store } = setUp();
    model.useBrowserCopy();
    expect(model.problem()).toBe(RESTORE_MESSAGES.noCopy);

    localStore.values.set(BROWSER_BACKUP_KEY, JSON.stringify(BACKUP));
    model.useBrowserCopy();
    model.confirmRestore();

    expect(model.problem()).toBeNull();
    expect(store.documents.has('drafts/home__hero')).toBe(true);
  });

  it('should say so when restoring fails, and keep the question open', () => {
    const { model, files, show } = setUp();
    files.text = JSON.stringify(BACKUP);
    vi.spyOn(TestBed.inject(BackupService), 'restore').mockReturnValue(
      throwError(() => new Error('offline')),
    );
    model.chooseFile(new Blob());

    model.confirmRestore();

    expect(show).toHaveBeenCalledWith(RESTORE_MESSAGES.failed, ToastTone.Error);
    expect(model.pending()).not.toBeNull();
  });

  it('should drop the question on cancel, and ignore a confirm with nothing chosen', () => {
    const { model, files, store } = setUp();
    files.text = JSON.stringify(BACKUP);
    model.chooseFile(new Blob());

    model.cancelRestore();
    model.confirmRestore();

    expect(model.pending()).toBeNull();
    expect(store.commits).toEqual([]);
  });

  it('should add the leads when ticked, and say to keep the file safe', () => {
    const { model, show, files } = setUp({ 'proposals/a': { name: 'Asha' } });

    model.withLeads.setValue(true);
    model.download();

    expect(model.leadsTicked()).toBe(true);
    expect(files.downloads[0]?.text).toContain('Asha');
    expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.withLeads);
  });
});
