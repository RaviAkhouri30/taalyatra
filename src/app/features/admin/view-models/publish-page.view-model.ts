import { Injectable, computed, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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
import { APPROVAL_NOTE_MAX } from '../models/approval.model';
import { type IPublishRecord } from '../models/i-publish-record';
import { ManagerArea } from '../models/manager-area.enum';
import { PUBLISH_INTRO, PublishPageModel } from '../models/publish-page.model';
import { type IPublishPlan, planButtonText, planConfirmText } from '../models/review.model';
import { SECTIONS_WITH_TABS } from '../schemas/editor-tabs';
import { ApprovalService } from '../services/approval.service';
import { BackupService } from '../services/backup.service';
import { DraftService } from '../services/draft.service';
import { MediaLibraryService } from '../services/media-library.service';
import { PublishService } from '../services/publish.service';
import { ReviewService } from '../services/review.service';
import { downloadBackup } from './backup-download';
import { EditorLayoutViewModel } from './editor-layout.view-model';
import { SELF_APPROVALS_SEEN_KEY, newestManagersApproval } from '../models/self-approvals';
import { DeviceStoreService } from '../services/device-store.service';

/** What the account is told after each action. */
export const PUBLISH_MESSAGES = {
  published: 'Published. Visitors see the changes on their next visit.',
  sent: 'Sent for approval. You’ll see the answer here and on your dashboard.',
  publishedAndSent: 'Published, and the rest sent for approval.',
  approved: 'Approved and published. The owner sees your title and note in the history.',
  publishFailed: 'Couldn’t publish. Nothing changed on the site; please try again.',
  discarded: 'Draft thrown away.',
  restored: 'That version is back in your draft. Review it, then publish.',
  failed: 'Something went wrong. Please try again.',
} as const;

const NOTHING: IPublishPlan = { publish: [], send: [], approve: [] };

/** The most characters of a self-approval's title (0023 D2; mirrors `firestore.rules`). */
export const SELF_APPROVAL_TITLE_MAX = 80;

/**
 * Review & publish (0008 D4, D5, D18; 0016 V3; 0019): the changes with who made them, ticked to
 * choose what goes; checks; publishing, or sending for approval; and the history to go back to.
 */
@Injectable()
export class PublishPageViewModel extends ViewModel<PublishPageModel> {
  /** The ticked changes; the account's own to start with (decision 4). */
  public readonly selected = signal<ReadonlySet<string>>(new Set());
  /** The manager's note for the owner, sent with changes that need approval. */
  public readonly note = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(APPROVAL_NOTE_MAX)],
  });
  /** A manager's own approval (0023 D2): a title and what changed and why, both optional. */
  public readonly approvalTitle = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(SELF_APPROVAL_TITLE_MAX)],
  });
  public readonly approvalNote = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(APPROVAL_NOTE_MAX)],
  });
  /** The publish confirmation is showing. */
  public readonly confirming = signal(false);
  /** The history record whose go-back is being confirmed. */
  public readonly goingBack = signal<string | null>(null);
  /** A publish, discard, go-back or backup is running. */
  public readonly busy = signal(false);
  /** A publish just finished: the backups card offers to keep a copy of it (0016 V13). */
  public readonly justPublished = signal(false);
  /** The owner, or a super manager standing in for them (0024): anyone's changes, restoring. */
  public readonly actsAsOwner = computed(
    () => this.data()?.review.permissions.actsAsOwner ?? false,
  );
  /** The owner's areas this account may use here (0022). */
  public readonly canBackUp = computed(() => this.can(ManagerArea.Backups));
  public readonly canSeeLeads = computed(() => this.can(ManagerArea.Leads));
  public readonly canGoBack = computed(() => this.can(ManagerArea.GoingBack));
  /** The page's intro line, once the account is known. */
  public readonly intro = computed(() => {
    const permissions = this.data()?.review.permissions;
    if (!permissions) {
      return '';
    }
    return permissions.actsAsOwner ? PUBLISH_INTRO.owner : PUBLISH_INTRO.manager;
  });
  /** What a click does with the ticked changes. */
  public readonly plan = computed(() => this.data()?.review.planFor(this.selected()) ?? NOTHING);
  /** What the checks find in the ticked changes. */
  public readonly report = computed(() =>
    this.data()?.reportFor(this.selected(), this.clock.now()),
  );
  public readonly buttonText = computed(() => planButtonText(this.plan()));
  public readonly confirmText = computed(() => planConfirmText(this.plan()));
  public readonly confirmButtonText = computed(() => {
    const plan = this.plan();
    if (plan.approve.length > 0) {
      return 'Yes, approve and publish';
    }
    return plan.publish.length > 0 ? 'Yes, publish' : 'Yes, send';
  });
  public readonly canPublish = computed(() => {
    const plan = this.plan();
    const chosen = plan.publish.length + plan.send.length + plan.approve.length > 0;
    return chosen && this.report()?.canPublish === true && !this.busy();
  });

  private readonly reviews = inject(ReviewService);
  private readonly drafts = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly approvals = inject(ApprovalService);
  private readonly library = inject(MediaLibraryService);
  private readonly backups = inject(BackupService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly device = inject(DeviceStoreService);
  private readonly reloads = new Subject<void>();
  private readonly publishRequests = new Subject<void>();
  private readonly discardRequests = new Subject<string>();
  private readonly goBackRequests = new Subject<IPublishRecord>();
  private readonly backupRequests = new Subject<void>();

  /**
   * @param path A change's document.
   * @param ticked Whether it goes with the next publish.
   */
  public toggle(path: string, ticked: boolean): void {
    const selected = new Set(this.selected());
    if (ticked) {
      selected.add(path);
    } else {
      selected.delete(path);
    }
    this.selected.set(selected);
    this.confirming.set(false);
  }

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
    // A restored backup changes the drafts from the backups card; the layout says so. An
    // answered request changes which drafts are waiting.
    return merge(this.reloads, this.layout.changes$, this.approvals.changed$).pipe(
      startWith(undefined),
      // switchMap: a newer reload replaces one still in flight.
      switchMap(() =>
        forkJoin([
          this.reviews.review(),
          this.publishes.history(),
          // A failed read means "not known": that skips one check, and mustn't stop all publishing.
          this.library.assets().pipe(catchError(() => of(null))),
        ]),
      ),
      map(([review, history, assets]) => {
        const libraryIds = assets && new Set(assets.map((asset) => asset.id));
        return new PublishPageModel(review, history, SECTIONS_WITH_TABS, libraryIds);
      }),
      tap((page) => {
        this.setData(page);
        this.selected.set(page.review.mine());
        this.markSelfApprovalsSeen(page);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // exhaustMap: a second click while publishing is ignored.
      this.publishRequests.pipe(exhaustMap(() => this.runPlan(this.plan()))),
      // concatMap: discards apply one after another, each fully.
      this.discardRequests.pipe(
        concatMap((path) => this.run(this.drafts.discard([path]), PUBLISH_MESSAGES.discarded)),
      ),
      this.goBackRequests.pipe(exhaustMap((record) => this.runGoBack(record))),
      this.backupStreams(),
    );
  }

  /**
   * Publishes what may go live, with the manager's own approval when they approve some (0023), then
   * sends the rest for approval.
   */
  private runPlan(plan: IPublishPlan): Observable<unknown> {
    const review = this.data()?.review;
    const live = [...plan.publish, ...plan.approve];
    const extras =
      plan.approve.length > 0
        ? {
            selfApproval: {
              title: this.approvalTitle.value.trim(),
              note: this.approvalNote.value.trim(),
            },
          }
        : {};
    const published =
      review && live.length > 0 ? this.publishes.publish(review.draftsOf(live), extras) : of(null);
    const action = published.pipe(
      tap(() => {
        this.justPublished.set(live.length > 0);
        this.approvalTitle.reset();
        this.approvalNote.reset();
      }),
      // switchMap: sent only once the publish is stored, so a refused publish sends nothing.
      switchMap(() =>
        plan.send.length > 0 ? this.approvals.send(plan.send, this.note.value) : of(undefined),
      ),
      tap(() => {
        this.note.reset();
      }),
    );
    return this.run(action, this.successOf(plan), PUBLISH_MESSAGES.publishFailed);
  }

  private successOf(plan: IPublishPlan): string {
    if (plan.approve.length > 0) {
      return PUBLISH_MESSAGES.approved;
    }
    if (plan.send.length === 0) {
      return PUBLISH_MESSAGES.published;
    }
    return plan.publish.length === 0 ? PUBLISH_MESSAGES.sent : PUBLISH_MESSAGES.publishedAndSent;
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

  /** Runs an action, then reloads the page, recounts drafts and tells the account how it went. */
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

  /** The owner has now seen every managers' approval in the history (0023 D3, 0024 D6). */
  private markSelfApprovalsSeen(page: PublishPageModel): void {
    const newest = newestManagersApproval(page.history.map((entry) => entry.record));
    if (page.review.permissions.isOwner && newest !== null) {
      this.device.set(SELF_APPROVALS_SEEN_KEY, newest);
    }
  }

  private can(area: ManagerArea): boolean {
    return this.data()?.review.permissions.canUse(area) ?? false;
  }
}
