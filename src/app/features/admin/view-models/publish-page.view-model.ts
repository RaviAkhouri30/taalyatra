import { Injectable, inject, signal } from '@angular/core';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  concatMap,
  exhaustMap,
  finalize,
  forkJoin,
  map,
  merge,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { type IPublishRecord } from '../models/i-publish-record';
import { PublishPageModel } from '../models/publish-page.model';
import { PublishReport } from '../models/publish-report.model';
import { ALL_SECTIONS, SECTIONS_WITH_TABS } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
import { MediaLibraryService } from '../services/media-library.service';
import { BackupService } from '../services/backup.service';
import { PublishService } from '../services/publish.service';
import { downloadBackup } from './backup-download';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What the owner is told after each action. */
export const PUBLISH_MESSAGES = {
  published: 'Published. Visitors see the changes on their next visit.',
  publishFailed: 'Couldn’t publish. Nothing changed on the site; please try again.',
  discarded: 'Draft thrown away.',
  restored: 'That version is back in your draft. Review it, then publish.',
  failed: 'Something went wrong. Please try again.',
} as const;

/**
 * Review & publish (0008 D4, D5, D18; 0016 V3): drafts, checks, publish with confirmation, and
 * the history to go back to.
 */
@Injectable()
export class PublishPageViewModel extends ViewModel<PublishPageModel> {
  /** The publish confirmation is showing. */
  public readonly confirming = signal(false);
  /** The history record whose go-back is being confirmed. */
  public readonly goingBack = signal<string | null>(null);
  /** A publish, discard, go-back or backup is running. */
  public readonly busy = signal(false);
  /** A publish just finished: the backups card offers to keep a copy of it (0016 V13). */
  public readonly justPublished = signal(false);

  private readonly drafts = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly library = inject(MediaLibraryService);
  private readonly backups = inject(BackupService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly reloads = new Subject<void>();
  private readonly publishRequests = new Subject<void>();
  private readonly discardRequests = new Subject<string>();
  private readonly goBackRequests = new Subject<IPublishRecord>();
  private readonly backupRequests = new Subject<void>();

  public askToPublish(): void {
    this.confirming.set(true);
  }

  public publish(): void {
    this.publishRequests.next();
  }

  public cancel(): void {
    this.confirming.set(false);
    this.goingBack.set(null);
  }

  public discard(path: string): void {
    this.discardRequests.next(path);
  }

  public askToGoBack(record: IPublishRecord): void {
    this.goingBack.set(record.id);
  }

  public goBack(record: IPublishRecord): void {
    this.goBackRequests.next(record);
  }

  public downloadBackup(): void {
    this.backupRequests.next();
  }

  protected override attachViewHandler(): Observable<unknown> {
    // A restored backup changes the drafts from the backups card; the layout says so.
    return merge(this.reloads, this.layout.changes$).pipe(
      startWith(undefined),
      // switchMap: a newer reload replaces one still in flight.
      switchMap(() =>
        forkJoin([
          this.drafts.drafts(),
          this.publishes.history(),
          // A failed read means "not known": that skips one check, and mustn't stop all publishing.
          this.library.assets().pipe(catchError(() => of(null))),
        ]),
      ),
      map(([drafts, history, assets]) => {
        const libraryIds = assets && new Set(assets.map((asset) => asset.id));
        const report = PublishReport.check(drafts, ALL_SECTIONS, this.clock.now(), libraryIds);
        return new PublishPageModel(drafts, history, SECTIONS_WITH_TABS, report);
      }),
      tap((page) => {
        this.setData(page);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // exhaustMap: a second click while publishing is ignored.
      this.publishRequests.pipe(
        exhaustMap(() =>
          this.run(
            this.publishes.publish(this.data()?.drafts ?? new Map()).pipe(
              tap(() => {
                this.justPublished.set(true);
              }),
            ),
            PUBLISH_MESSAGES.published,
            PUBLISH_MESSAGES.publishFailed,
          ),
        ),
      ),
      // concatMap: discards apply one after another, each fully.
      this.discardRequests.pipe(
        concatMap((path) => this.run(this.drafts.discard([path]), PUBLISH_MESSAGES.discarded)),
      ),
      this.goBackRequests.pipe(exhaustMap((record) => this.runGoBack(record))),
      this.backupStreams(),
    );
  }

  private backupStreams(): Observable<unknown> {
    return merge(
      // A backup made anywhere covers the publish: the card stops suggesting one.
      this.backups.made$.pipe(
        tap(() => {
          this.justPublished.set(false);
        }),
      ),
      // exhaustMap: a second click while the backup is being made is ignored.
      this.backupRequests.pipe(
        exhaustMap(() => this.withBusy(downloadBackup(this.backups, this.toasts))),
      ),
    );
  }

  private runGoBack(record: IPublishRecord): Observable<unknown> {
    const history = this.data()?.history.map((entry) => entry.record) ?? [];
    return this.run(this.publishes.goBack(record, history), PUBLISH_MESSAGES.restored);
  }

  private withBusy(action: Observable<unknown>): Observable<unknown> {
    this.busy.set(true);
    return action.pipe(
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }

  /** Runs an action, then reloads the page, recounts drafts and tells the owner how it went. */
  private run(
    action: Observable<unknown>,
    success: string,
    failure: string = PUBLISH_MESSAGES.failed,
  ): Observable<unknown> {
    this.busy.set(true);
    return action.pipe(
      tap(() => {
        this.toasts.show(success);
        this.cancel();
        this.reloads.next();
        this.layout.refreshChanges();
      }),
      // Long-lived command streams must survive a failed action.
      catchError(() => {
        this.toasts.show(failure, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }
}
