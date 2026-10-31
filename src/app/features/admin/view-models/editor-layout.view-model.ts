import { Injectable, type Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  finalize,
  map,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { SAVE_STATUS_TEXT } from '../models/editor-nav.constants';
import { SaveStatus } from '../models/save-status.enum';
import { DraftService } from '../services/draft.service';
import { AdminPageViewModel } from './admin-page.view-model';

/**
 * The editor's frame: the signed-in account, sign-out, the autosave status every tab reports to,
 * and how many documents have unpublished changes. Provided by the editor layout, so the pages
 * inside it share one instance.
 */
@Injectable()
export class EditorLayoutViewModel extends AdminPageViewModel {
  public readonly status = signal(SaveStatus.Idle);
  public readonly statusText = computed(() => SAVE_STATUS_TEXT[this.status()]);
  public readonly failed = computed(() => this.status() === SaveStatus.Failed);
  /** How many documents have a draft. */
  public readonly changeCount = signal(0);
  public readonly signingOut = signal(false);
  public readonly email: Signal<string>;
  /** Emits when the owner asks to retry a failed save. */
  public readonly retries$: Observable<void>;

  private readonly auth = inject(IAuthService);
  private readonly router = inject(Router);
  private readonly drafts = inject(DraftService);
  private readonly signOuts = new Subject<void>();
  private readonly refreshes = new Subject<void>();
  private readonly retryRequests = new Subject<void>();

  public constructor() {
    super();
    // Assigned here because they read private fields declared after the public ones.
    this.email = toSignal(this.auth.user$.pipe(map((user) => user?.email ?? '')), {
      initialValue: '',
    });
    this.retries$ = this.retryRequests.asObservable();
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

  public signOut(): void {
    this.signOuts.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(this.countChanges(), this.signOutFlow());
  }

  private countChanges(): Observable<unknown> {
    return this.refreshes.pipe(
      startWith(undefined),
      // switchMap: only the latest count matters; an older read in flight is dropped.
      switchMap(() => this.drafts.drafts().pipe(catchError(() => EMPTY))),
      tap((drafts) => {
        this.changeCount.set(drafts.size);
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
