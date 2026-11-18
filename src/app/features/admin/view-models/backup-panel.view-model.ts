import { Injectable, inject, signal } from '@angular/core';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  finalize,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IFileService } from '@core/interfaces/i-file-service';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { BACKUP_PROBLEMS, type IBackup, checkBackup } from '../models/backup-file';
import { BackupStatus } from '../models/backup-status.model';
import { formatMoment } from '../models/editor-dates';
import { BackupService } from '../services/backup.service';
import { downloadBackup } from './backup-download';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What the backups card shows. */
export interface IBackupPanel {
  readonly status: BackupStatus;
  /** When this browser's copy was made, or `null` when it has none. */
  readonly browserCopyWhen: string | null;
}

/** A backup waiting for the owner to confirm restoring it. */
export interface IPendingRestore {
  readonly backup: IBackup;
  readonly when: string;
}

/** What the owner is told about restoring. */
export const RESTORE_MESSAGES = {
  restored: 'The backup is in your draft. Check the changes above, then publish or undo them.',
  failed: 'Couldn’t restore the backup. Nothing changed; please try again.',
  noCopy: 'This browser has no backup to restore.',
} as const;

/**
 * The backups card (0016 V13): when the last one was made, making one, and restoring one from
 * a file or this browser, into the drafts only.
 */
@Injectable()
export class BackupPanelViewModel extends ViewModel<IBackupPanel> {
  /** A backup is being made or restored. */
  public readonly busy = signal(false);
  /** The backup the owner chose, waiting for them to confirm. */
  public readonly pending = signal<IPendingRestore | null>(null);
  /** Why the chosen file can't be restored. */
  public readonly problem = signal<string | null>(null);

  private readonly backups = inject(BackupService);
  private readonly files = inject(IFileService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly downloads = new Subject<void>();
  private readonly chosenFiles = new Subject<Blob>();
  private readonly restores = new Subject<IBackup>();

  public download(): void {
    this.downloads.next();
  }

  /** @param file The file the owner chose to restore. */
  public chooseFile(file: Blob): void {
    this.chosenFiles.next(file);
  }

  public useBrowserCopy(): void {
    const backup = this.backups.browserCopy();
    if (backup === null) {
      this.problem.set(RESTORE_MESSAGES.noCopy);
      return;
    }
    this.ask(backup);
  }

  public confirmRestore(): void {
    const pending = this.pending();
    if (pending) {
      this.restores.next(pending.backup);
    }
  }

  public cancelRestore(): void {
    this.pending.set(null);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.backups.made$.pipe(
      startWith(undefined),
      // switchMap: only the newest date matters.
      switchMap(() =>
        // A failed read means "not known": the card still offers backups, as if there were none.
        this.backups.lastMade().pipe(catchError(() => of(null))),
      ),
      map((lastAt) => {
        const copy = this.backups.browserCopy();
        return {
          status: new BackupStatus(lastAt, this.clock.now()),
          browserCopyWhen: copy && formatMoment(copy.createdAt),
        };
      }),
      tap((panel) => {
        this.setData(panel);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // exhaustMap: a second click while a backup is being made is ignored.
      this.downloads.pipe(
        exhaustMap(() => this.running(downloadBackup(this.backups, this.toasts))),
      ),
      // switchMap: a newly chosen file replaces one still being read.
      this.chosenFiles.pipe(switchMap((file) => this.readFile(file))),
      this.restores.pipe(exhaustMap((backup) => this.running(this.restore(backup)))),
    );
  }

  private readFile(file: Blob): Observable<unknown> {
    this.problem.set(null);
    this.pending.set(null);
    return this.files.read(file).pipe(
      tap((text) => {
        const result = checkBackup(text);
        if ('problem' in result) {
          this.problem.set(result.problem);
        } else {
          this.ask(result.backup);
        }
      }),
      catchError(() => {
        this.problem.set(BACKUP_PROBLEMS.unreadable);
        return EMPTY;
      }),
    );
  }

  private ask(backup: IBackup): void {
    this.problem.set(null);
    this.pending.set({ backup, when: formatMoment(backup.createdAt) });
  }

  private restore(backup: IBackup): Observable<unknown> {
    return this.backups.restore(backup).pipe(
      tap(() => {
        this.pending.set(null);
        this.toasts.show(RESTORE_MESSAGES.restored);
        // The page lists the drafts: it reloads, and the menu recounts them.
        this.layout.refreshChanges();
      }),
      catchError(() => {
        this.toasts.show(RESTORE_MESSAGES.failed, ToastTone.Error);
        return EMPTY;
      }),
    );
  }

  private running(action: Observable<unknown>): Observable<unknown> {
    this.busy.set(true);
    return action.pipe(
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }
}
