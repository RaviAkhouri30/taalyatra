import { EMPTY, type Observable, catchError, tap } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ToastService } from '@shared/services/toast.service';
import { type BackupService, type IBackupMade } from '../services/backup.service';

/** What the owner is told after making a backup (0016 V13). */
export const BACKUP_MESSAGES = {
  kept: 'Backup downloaded, and a copy kept in this browser.',
  notKept: 'Backup downloaded. It’s too big to keep a copy in this browser as well.',
  failed: 'Couldn’t make a backup, so nothing was downloaded. Please try again.',
} as const;

/**
 * Makes a backup and tells the owner how it went. Shared by every place that offers one: the
 * backups card, after a publish, and before going back.
 * @param backups Makes the backup.
 * @param toasts Tells the owner.
 * @returns The backup made; nothing when it failed (the failure is told, and the stream lives on).
 */
export function downloadBackup(
  backups: BackupService,
  toasts: ToastService,
): Observable<IBackupMade> {
  return backups.make().pipe(
    tap((made) => {
      toasts.show(made.keptInBrowser ? BACKUP_MESSAGES.kept : BACKUP_MESSAGES.notKept);
    }),
    // Long-lived command streams must survive a failed backup.
    catchError(() => {
      toasts.show(BACKUP_MESSAGES.failed, ToastTone.Error);
      return EMPTY;
    }),
  );
}
