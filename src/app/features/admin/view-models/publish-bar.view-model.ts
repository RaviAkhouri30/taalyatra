import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
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
import { type IDraft } from '@core/interfaces/i-draft';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { PublishReport } from '../models/publish-report.model';
import { SaveStatus } from '../models/save-status.enum';
import { SAVE_STATUS_TEXT } from '../models/editor-nav.constants';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
import { MediaLibraryService } from '../services/media-library.service';
import { PublishService } from '../services/publish.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What the bar knows about the owner's drafts. */
export interface IPublishBarState {
  readonly drafts: ReadonlyMap<string, IDraft>;
  /** How many things stop publishing. */
  readonly problems: number;
}

/** What the owner is told after each action. */
export const PUBLISH_BAR_MESSAGES = {
  published: 'Published. You can undo it from Review & publish.',
  publishFailed: 'Couldn’t publish. Nothing changed on the site; please try again.',
  discarded: 'Your unpublished changes are gone.',
  discardFailed: 'Couldn’t discard your changes. Please try again.',
} as const;

/**
 * The bar under every editor page: whether there's anything to publish, and publishing or discarding
 * it there and then. The review page stays for looking through changes first and for undoing.
 */
@Injectable()
export class PublishBarViewModel extends ViewModel<IPublishBarState> {
  /** How many documents have unpublished changes. */
  public readonly count = computed(() => this.data()?.drafts.size ?? 0);
  /** How many things stop publishing. */
  public readonly problems = computed(() => this.data()?.problems ?? 0);
  /** A publish or discard is running. */
  public readonly busy = signal(false);
  /** Asking the owner to confirm throwing their changes away. */
  public readonly confirmingDiscard = signal(false);
  /** Whether a save failed, so it can be retried. */
  public readonly failed = computed(() => this.layout.status() === SaveStatus.Failed);
  /** Whether the bar has something to act on. */
  public readonly hasChanges = computed(() => this.count() > 0);
  /** Publishing is off while a save is running or failed, or while something needs fixing. */
  public readonly canPublish = computed(
    () =>
      this.hasChanges() &&
      !this.busy() &&
      !this.failed() &&
      this.problems() === 0 &&
      this.layout.status() !== SaveStatus.Saving,
  );
  /** The status line. */
  public readonly statusText = computed(() => {
    const status = this.layout.status();
    const count = this.count();
    if (status === SaveStatus.Saving) {
      return SAVE_STATUS_TEXT[SaveStatus.Saving];
    }
    if (status === SaveStatus.Failed) {
      return SAVE_STATUS_TEXT[SaveStatus.Failed];
    }
    if (count === 0) {
      return 'All changes published.';
    }
    if (status === SaveStatus.Saved) {
      return SAVE_STATUS_TEXT[SaveStatus.Saved];
    }
    return `${String(count)} unpublished ${count === 1 ? 'change' : 'changes'}.`;
  });

  private readonly layout = inject(EditorLayoutViewModel);
  private readonly draftService = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly library = inject(MediaLibraryService);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly publishRequests = new Subject<void>();
  private readonly discardRequests = new Subject<void>();

  public publish(): void {
    this.publishRequests.next();
  }

  public askToDiscard(): void {
    this.confirmingDiscard.set(true);
  }

  public cancelDiscard(): void {
    this.confirmingDiscard.set(false);
  }

  public discard(): void {
    this.discardRequests.next();
  }

  public retry(): void {
    this.layout.retry();
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.layout.changes$.pipe(
      startWith(undefined),
      // switchMap: only the newest picture of the drafts matters.
      switchMap(() => this.readState()),
      tap((state) => {
        this.setData(state);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // exhaustMap: a second click while one of these is running is ignored.
    return merge(
      this.publishRequests.pipe(exhaustMap(() => this.runPublish())),
      this.discardRequests.pipe(exhaustMap(() => this.runDiscard())),
    );
  }

  private readState(): Observable<IPublishBarState> {
    // forkJoin: both are needed to say whether publishing is allowed.
    return forkJoin([
      this.draftService.drafts(),
      // A failed read means "not known": that skips one check, and mustn't stop all publishing.
      this.library.assets().pipe(catchError(() => of(null))),
    ]).pipe(
      map(([drafts, assets]) => {
        const libraryIds = assets && new Set(assets.map((asset) => asset.id));
        const report = PublishReport.check(drafts, ALL_SECTIONS, this.clock.now(), libraryIds);
        return { drafts, problems: report.errors.length };
      }),
      // Long-lived: a failed read keeps the last picture, and the next change tries again.
      catchError(() => EMPTY),
    );
  }

  private runPublish(): Observable<unknown> {
    this.busy.set(true);
    return this.publishes.publish(this.data()?.drafts ?? new Map<string, IDraft>()).pipe(
      tap(() => {
        this.toasts.show(PUBLISH_BAR_MESSAGES.published);
        this.layout.refreshChanges();
      }),
      catchError(() => {
        this.toasts.show(PUBLISH_BAR_MESSAGES.publishFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }

  private runDiscard(): Observable<unknown> {
    this.busy.set(true);
    return this.draftService.discard([...(this.data()?.drafts.keys() ?? [])]).pipe(
      tap(() => {
        this.toasts.show(PUBLISH_BAR_MESSAGES.discarded);
        this.confirmingDiscard.set(false);
        this.layout.refreshChanges();
        // The page's form still holds what was thrown away, so it reloads from what's published.
        this.layout.resetContent();
      }),
      catchError(() => {
        this.toasts.show(PUBLISH_BAR_MESSAGES.discardFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }
}
