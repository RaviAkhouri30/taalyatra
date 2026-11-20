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
  take,
  tap,
} from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { type IApproval } from '../models/approval.model';
import { type IApprovalsPanel, approvalsPanel } from '../models/approvals-panel.model';
import { AccessService } from '../services/access.service';
import { ApprovalService } from '../services/approval.service';
import { DraftService } from '../services/draft.service';
import { MediaLibraryService } from '../services/media-library.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What the account is told after each answer. */
export const APPROVAL_MESSAGES = {
  approved: 'Approved and published. Visitors see it on their next visit.',
  sentBack: 'Sent back with your reason. The manager can carry on editing.',
  withdrawn: 'Withdrawn. You can edit those pages again.',
  approveOwn: 'Withdrawn and ticked below. Add a title and a note, then approve and publish them.',
  dismissed: 'Cleared from your list.',
  failed: 'Something went wrong. Nothing changed; please try again.',
} as const;

/** One action on a request, run when its turn comes. */
interface IApprovalCommand {
  readonly run: () => Observable<unknown>;
  readonly done: string;
}

/**
 * The approvals on Review & publish (0019 decision 5): the owner approves or sends back what's
 * waiting; a manager follows their own requests, withdrawing or clearing them.
 */
@Injectable()
export class ApprovalsPanelViewModel extends ViewModel<IApprovalsPanel> {
  /** An answer is being saved. */
  public readonly busy = signal(false);
  /** The panel's heading, or empty when there's nothing to show. */
  public readonly heading = computed(() => {
    const panel = this.data();
    const count = panel?.requests.length ?? 0;
    if (!panel || count === 0) {
      return '';
    }
    return panel.owner ? `Waiting for your approval (${String(count)})` : 'Your requests';
  });

  private readonly access = inject(AccessService);
  private readonly approvals = inject(ApprovalService);
  private readonly drafts = inject(DraftService);
  private readonly library = inject(MediaLibraryService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly toasts = inject(ToastService);
  private readonly clock = inject(CLOCK);
  private readonly commands = new Subject<IApprovalCommand>();

  /** @param approval A waiting request: its drafts go live, as they are now. */
  public approve(approval: IApproval): void {
    this.commands.next({
      // The drafts are read when it runs, so any adjustment the owner just made is included.
      run: () =>
        this.drafts.drafts().pipe(
          // switchMap: one approval per read.
          switchMap((drafts) => this.approvals.approve(approval, drafts)),
        ),
      done: APPROVAL_MESSAGES.approved,
    });
  }

  /**
   * @param approval A waiting request.
   * @param reason Why, for the manager.
   */
  public sendBack(approval: IApproval, reason: string): void {
    this.commands.next({
      run: () => this.approvals.sendBack(approval, reason),
      done: APPROVAL_MESSAGES.sentBack,
    });
  }

  /** @param approval The manager's waiting request. */
  public withdraw(approval: IApproval): void {
    this.commands.next({
      run: () => this.approvals.withdraw(approval),
      done: APPROVAL_MESSAGES.withdrawn,
    });
  }

  /**
   * Takes a waiting request back so the manager approves it themselves (0023 D4): withdrawn, its
   * changes are theirs again and ticked on Review & publish, ready to approve and publish.
   * @param approval The manager's waiting request.
   */
  public approveOwn(approval: IApproval): void {
    this.commands.next({
      run: () => this.approvals.withdraw(approval),
      done: APPROVAL_MESSAGES.approveOwn,
    });
  }

  /** @param approval The manager's answered request. */
  public dismiss(approval: IApproval): void {
    this.commands.next({
      run: () => this.approvals.dismiss(approval),
      done: APPROVAL_MESSAGES.dismissed,
    });
  }

  protected override attachViewHandler(): Observable<unknown> {
    return merge(this.approvals.changed$, this.layout.changes$).pipe(
      startWith(undefined),
      // switchMap: only the newest picture matters.
      switchMap(() => this.read()),
      tap((panel) => {
        this.setData(panel);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // exhaustMap: a second click while an answer is being saved is ignored.
    return this.commands.pipe(exhaustMap((command) => this.run(command)));
  }

  private read(): Observable<IApprovalsPanel> {
    // forkJoin: independent reads, all needed for the panel.
    return forkJoin([
      this.access.permissions$.pipe(take(1)),
      this.approvals.requests(),
      this.drafts.drafts(),
      // A failed read means "not known": that skips one check.
      this.library.assets().pipe(catchError(() => of(null))),
    ]).pipe(
      map(([permissions, requests, drafts, assets]) =>
        approvalsPanel({
          permissions,
          requests,
          drafts,
          libraryIds: assets && new Set(assets.map((asset) => asset.id)),
          now: this.clock.now(),
        }),
      ),
      // Before the 2.0.0 rules are live the requests are refused: the panel stays empty.
      catchError(() => EMPTY),
    );
  }

  private run(command: IApprovalCommand): Observable<unknown> {
    this.busy.set(true);
    return command.run().pipe(
      tap(() => {
        this.toasts.show(command.done);
      }),
      // Inside the exhaustMap, so one failure can't end the stream.
      catchError(() => {
        this.toasts.show(APPROVAL_MESSAGES.failed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.busy.set(false);
      }),
    );
  }
}
