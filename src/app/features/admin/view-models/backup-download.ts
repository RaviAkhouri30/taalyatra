import { EMPTY, type Observable, catchError, tap } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ToastService } from '@shared/services/toast.service';
import { type BackupService, type IBackupMade } from '../services/backup.service';

/** What the owner is told after making a backup (0016 V13). */
export const BACKUP_MESSAGES = {
  kept: 'Backup downloaded, and a copy kept in this browser.',
  notKept: 'Backup downloaded. It’s too big to keep a copy in this browser as well.',
  withLeads:
    'Backup with leads downloaded. It holds customers’ details, so keep it somewhere safe. It isn’t kept in this browser.',
  failed: 'Couldn’t make a backup, so nothing was downloaded. Please try again.',
} as const;

function madeMessage(made: IBackupMade): string {
  if (made.withLeads) {
    return BACKUP_MESSAGES.withLeads;
  }
  return made.keptInBrowser ? BACKUP_MESSAGES.kept : BACKUP_MESSAGES.notKept;
}

/**
 * Makes a backup and tells the owner how it went. Shared by every place that offers one: the
 * backups card, after a publish, and before going back.
 * @param backups Makes the backup.
 * @param toasts Tells the owner.
 * @param withLeads Whether to add the leads (0018 D6).
 * @returns The backup made; nothing when it failed (the failure is told, and the stream lives on).
 */
export function downloadBackup(
  backups: BackupService,
  toasts: ToastService,
  withLeads = false,
): Observable<IBackupMade> {
  return backups.make(withLeads).pipe(
    tap((made) => {
      toasts.show(madeMessage(made));
    }),
    // Long-lived command streams must survive a failed backup.
    catchError(() => {
      toasts.show(BACKUP_MESSAGES.failed, ToastTone.Error);
      return EMPTY;
    }),
  );
}
