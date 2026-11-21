import { Injectable, type Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  filter,
  finalize,
  map,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { ADMIN_DEVICE_KEY } from '@shared/constants/visit.constants';
import { AppRoute } from '@shared/enums/app-route.enum';
import { ApprovalStatus } from '../models/approval.model';
import { SAVE_STATUS_TEXT, navGroupsFor } from '../models/editor-nav.constants';
import { LeadStatus } from '../models/lead.model';
import { Permissions } from '../models/permissions.model';
import { SaveStatus } from '../models/save-status.enum';
import { AccessService } from '../services/access.service';
import { ApprovalService } from '../services/approval.service';
import { DeviceStoreService } from '../services/device-store.service';
import { DraftService } from '../services/draft.service';
import { LeadsService } from '../services/leads.service';
import { ReleaseNotesService } from '../services/release-notes.service';
import { AdminPageViewModel } from './admin-page.view-model';

/**
 * The editor's frame: the signed-in account and what it may do (0019), sign-out, the autosave
 * status every tab reports to, and how many documents have unpublished changes. Provided by the
 * editor layout, so the pages inside it share one instance.
 */
@Injectable()
export class EditorLayoutViewModel extends AdminPageViewModel {
  public readonly status = signal(SaveStatus.Idle);
  public readonly statusText = computed(() => SAVE_STATUS_TEXT[this.status()]);
  public readonly failed = computed(() => this.status() === SaveStatus.Failed);
  /** How many documents have a draft. */
  public readonly changeCount = signal(0);
  public readonly signingOut = signal(false);
  /** How many leads are still new (0018 V12). */
  public readonly newLeads = signal(0);
  /** For the owner, requests waiting for approval; for a manager, their requests sent back (0019). */
  public readonly approvalsToSee = signal(0);
  /** What the count beside Review & publish means. */
  public readonly approvalsWord = computed(() =>
    this.permissions().actsAsOwner ? 'waiting' : 'sent back',
  );
  /** What the signed-in account may do; the guard has read it before the layout opens. */
  public readonly permissions: Signal<Permissions>;
  /** The side panel this account sees. */
  public readonly groups = computed(() => navGroupsFor(this.permissions()));
  /** A release the owner hasn't opened What's new for yet (0016 V1). */
  public readonly hasNews: Signal<boolean>;
  public readonly email: Signal<string>;
  /** Emits when the owner asks to retry a failed save. */
  public readonly retries$: Observable<void>;
  /** Emits whenever the drafts may have changed. */
  public readonly changes$: Observable<void>;
  /** Emits when the drafts were thrown away, so pages reload what they show. */
  public readonly contentResets$: Observable<void>;

  private readonly auth = inject(IAuthService);
  private readonly router = inject(Router);
  private readonly drafts = inject(DraftService);
  private readonly releaseNotes = inject(ReleaseNotesService);
  private readonly leads = inject(LeadsService);
  private readonly access = inject(AccessService);
  private readonly approvals = inject(ApprovalService);
  private readonly news = signal(false);
  private readonly signOuts = new Subject<void>();
  private readonly refreshes = new Subject<void>();
  private readonly retryRequests = new Subject<void>();
  private readonly contentResets = new Subject<void>();

  public constructor() {
    super();
    // Assigned here because they read private fields declared after the public ones.
    this.email = toSignal(this.auth.user$.pipe(map((user) => user?.email ?? '')), {
      initialValue: '',
    });
    this.permissions = toSignal(this.access.permissions$, { initialValue: Permissions.none() });
    this.retries$ = this.retryRequests.asObservable();
    this.changes$ = this.refreshes.asObservable();
    this.contentResets$ = this.contentResets.asObservable();
    this.news.set(this.releaseNotes.hasUnseen());
    this.hasNews = this.news.asReadonly();
    // The owner's own visits to the site aren't counted from this browser (0018 decision 3).
    inject(DeviceStoreService).set(ADMIN_DEVICE_KEY, '1');
  }

  /** The owner has opened What's new: the New marker goes. */
  public markReleasesSeen(): void {
    this.releaseNotes.markSeen();
    this.news.set(false);
  }

  public reportSaving(): void {
    this.status.set(SaveStatus.Saving);
  }

  public reportSaved(): void {
    this.status.set(SaveStatus.Saved);
    this.refreshChanges();
  }

  public reportFailed(): void {
    this.status.set(SaveStatus.Failed);
  }

  /** Re-counts the drafts, e.g. after a publish or a discard. */
  public refreshChanges(): void {
    this.refreshes.next();
  }

  public retry(): void {
    this.retryRequests.next();
  }

  /** Tells the page its drafts are gone. */
  public resetContent(): void {
    this.status.set(SaveStatus.Idle);
    this.contentResets.next();
  }

  public signOut(): void {
    this.signOuts.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      this.countChanges(),
      this.countNewLeads(),
      this.countApprovals(),
      this.signOutFlow(),
    );
  }

  private countNewLeads(): Observable<unknown> {
    return this.leads.changed$.pipe(
      startWith(undefined),
      // The owner's and a super manager's (0024): nothing is read for another manager.
      filter(() => this.permissions().actsAsOwner),
      // switchMap: only the latest count matters. A failed read leaves the count as it was.
      switchMap(() => this.leads.leads().pipe(catchError(() => EMPTY))),
      tap((leads) => {
        this.newLeads.set(leads.filter((lead) => lead.status === LeadStatus.New).length);
      }),
    );
  }

  private countChanges(): Observable<unknown> {
    return merge(this.refreshes, this.approvals.changed$).pipe(
      startWith(undefined),
      // switchMap: only the latest count matters; an older read in flight is dropped.
      switchMap(() => this.drafts.drafts().pipe(catchError(() => EMPTY))),
      tap((drafts) => {
        const permissions = this.permissions();
        this.changeCount.set(
          [...drafts.keys()].filter((path) => permissions.canSeePath(path)).length,
        );
      }),
    );
  }

  private countApprovals(): Observable<unknown> {
    return merge(this.refreshes, this.approvals.changed$).pipe(
      startWith(undefined),
      // switchMap: only the latest count matters. A failed read leaves the count as it was.
      switchMap(() => this.approvals.requests().pipe(catchError(() => EMPTY))),
      tap((requests) => {
        const permissions = this.permissions();
        const counted = permissions.actsAsOwner
          ? requests.filter((request) => request.status === ApprovalStatus.Waiting)
          : requests.filter(
              (request) =>
                request.by === permissions.uid && request.status === ApprovalStatus.SentBack,
            );
        this.approvalsToSee.set(counted.length);
      }),
    );
  }

  private signOutFlow(): Observable<unknown> {
    return this.signOuts.pipe(
      tap(() => {
        this.signingOut.set(true);
      }),
      // exhaustMap: repeat clicks while signing out are ignored.
      exhaustMap(() =>
        this.auth.signOut().pipe(
          tap(() => {
            // The navigation's result isn't needed: the sign-in page renders either way.
            void this.router.navigateByUrl(AppRoute.AdminSignIn);
          }),
          catchError(() => EMPTY),
          finalize(() => {
            this.signingOut.set(false);
          }),
        ),
      ),
    );
  }
}
