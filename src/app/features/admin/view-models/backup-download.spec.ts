import { firstValueFrom, of, throwError, toArray } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ToastService } from '@shared/services/toast.service';
import { type BackupService } from '../services/backup.service';
import { BACKUP_MESSAGES, downloadBackup } from './backup-download';

describe('downloadBackup', () => {
  function run(make: BackupService['make']) {
    const show = vi.fn();
    const result = downloadBackup({ make } as BackupService, { show } as unknown as ToastService);
    return { show, result };
  }

  it('should say the backup was downloaded and kept in this browser', async () => {
    const { show, result } = run(() => of({ createdAt: 'x', keptInBrowser: true }));

    await firstValueFrom(result);

    expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.kept);
  });

  it('should say when it was too big to keep in this browser', async () => {
    const { show, result } = run(() => of({ createdAt: 'x', keptInBrowser: false }));

    await firstValueFrom(result);

    expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.notKept);
  });

  it('should say when it failed, and finish quietly so the stream lives on', async () => {
    const { show, result } = run(() => throwError(() => new Error('offline')));

    await expect(firstValueFrom(result.pipe(toArray()))).resolves.toEqual([]);
    expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.failed, ToastTone.Error);
  });
});
