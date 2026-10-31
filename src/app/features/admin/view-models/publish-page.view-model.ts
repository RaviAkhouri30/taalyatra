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
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
import { PublishService } from '../services/publish.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What the owner is told after each action. */
export const PUBLISH_MESSAGES = {
  published: 'Published. Visitors see the changes on their next visit.',
  publishFailed: 'Couldn’t publish. Nothing changed on the site; please try again.',
  discarded: 'Draft thrown away.',
  restored: 'That version is back in your draft. Review it, then publish.',
  failed: 'Something went wrong. Please try again.',
} as const;

/** Review & publish (0008 D4, D5, D18): drafts, checks, publish with confirmation, history. */
@Injectable()
export class PublishPageViewModel extends ViewModel<PublishPageModel> {
  /** The publish confirmation is showing. */
  public readonly confirming = signal(false);
  /** The history record whose restore is being confirmed. */
  public readonly restoring = signal<string | null>(null);
  /** A publish, discard or restore is running. */
  public readonly busy = signal(false);

  private readonly drafts = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly reloads = new Subject<void>();
  private readonly publishRequests = new Subject<void>();
  private readonly discardRequests = new Subject<string>();
  private readonly restoreRequests = new Subject<IPublishRecord>();

  public askToPublish(): void {
    this.confirming.set(true);
  }

  public publish(): void {
    this.publishRequests.next();
  }

  public cancel(): void {
    this.confirming.set(false);
    this.restoring.set(null);
  }

  public discard(path: string): void {
    this.discardRequests.next(path);
  }

  public askToRestore(record: IPublishRecord): void {
    this.restoring.set(record.id);
  }

  public restore(record: IPublishRecord): void {
    this.restoreRequests.next(record);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.reloads.pipe(
      startWith(undefined),
      // switchMap: a newer reload replaces one still in flight.
      switchMap(() => forkJoin([this.drafts.drafts(), this.publishes.history()])),
      map(
        ([drafts, history]) =>
          new PublishPageModel(drafts, history, ALL_SECTIONS, this.clock.now()),
      ),
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
            this.publishes.publish(this.data()?.drafts ?? new Map()),
            PUBLISH_MESSAGES.published,
            PUBLISH_MESSAGES.publishFailed,
          ),
        ),
      ),
      // concatMap: discards apply one after another, each fully.
      this.discardRequests.pipe(
        concatMap((path) => this.run(this.drafts.discard([path]), PUBLISH_MESSAGES.discarded)),
      ),
      this.restoreRequests.pipe(
        exhaustMap((record) => this.run(this.publishes.restore(record), PUBLISH_MESSAGES.restored)),
      ),
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
