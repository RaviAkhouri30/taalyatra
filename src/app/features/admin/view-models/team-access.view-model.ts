import { Injectable, computed, inject, signal } from '@angular/core';
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
  of,
  switchMap,
  tap,
} from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { AccountError, IAccountService } from '@core/interfaces/i-account-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { LoggerService } from '@core/services/logger.service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import {
  createRoleForm,
  fillRoleForm,
  resetRoleForm,
  roleFormValue,
  roleOf,
} from '../forms/role-form';
import { siteDay } from '../models/site-days';
import { type PageAccess } from '../models/role.model';
import { type IManager, PAGE_ROWS, RoleFormMode, byEmail } from '../models/team-access.model';
import { RolesService } from '../services/roles.service';

/** What the owner is told about Team access's actions. */
export const TEAM_MESSAGES = {
  saved: (email: string) =>
    `${email} is saved. The new settings apply from their next click; their menu changes the next time they open the admin.`,
  saveFailed: 'Couldn’t save the manager. Nothing changed; please try again.',
  invited: (email: string) =>
    `${email} is added. We’ve emailed them a link to set their password; then they can sign in.`,
  inviteEmailFailed: (email: string) =>
    `${email} is added, but the email didn’t send. They can use Forgot password on the sign-in page.`,
  removed: (email: string) => `${email} no longer has access.`,
  removeFailed: 'Couldn’t remove the manager. Nothing changed; please try again.',
} as const;

/**
 * Team access (0019): the owner's list of managers, each added, changed or removed. The owner
 * isn't on it and can't be added (decision 1), so nothing here can lock them out.
 */
@Injectable()
export class TeamAccessViewModel extends ViewModel<readonly IManager[]> {
  /** The manager form, shared by adding and changing. */
  public readonly form = createRoleForm(
    inject(APP_ENVIRONMENT).adminUid,
    () => this.listed(),
    () => siteDay(this.clock.now().getTime()),
  );
  public readonly failed = signal(false);
  public readonly mode = signal(RoleFormMode.Closed);
  public readonly saving = signal(false);
  /** Adding by pasting an account's id, instead of making the account from the email (0030). */
  public readonly pasteUid = signal(false);
  /** Why the account couldn't be made, in the owner's words; empty when nothing went wrong. */
  public readonly inviteProblem = signal('');
  /** The manager whose removal waits for the owner to confirm. */
  public readonly confirming = signal<string | null>(null);
  public readonly removing = signal(false);
  /** The form's heading: adding, or whom it changes. */
  public readonly formHeading = computed(() => {
    const editing = this.editing();
    return editing ? `Change ${editing.role.email}` : 'Add a manager';
  });
  public readonly count = computed(() => {
    const count = this.data()?.length ?? 0;
    return count === 1 ? '1 manager' : `${String(count)} managers`;
  });

  private readonly roles = inject(RolesService);
  private readonly accounts = inject(IAccountService);
  private readonly auth = inject(IAuthService);
  private readonly toasts = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly clock = inject(CLOCK);
  /** The manager being changed, whose added date is kept. */
  private readonly editing = signal<IManager | null>(null);
  private readonly submits = new Subject<void>();
  private readonly removals = new Subject<IManager>();

  /** Opens an empty form, with the defaults for a new manager: their email makes the account. */
  public add(): void {
    resetRoleForm(this.form);
    this.editing.set(null);
    this.inviteProblem.set('');
    this.usePastedUid(false);
    this.mode.set(RoleFormMode.Adding);
  }

  /**
   * @param on Add an existing account by its pasted id, or make one from the email. Off, the id's
   *   box is switched off, so the form doesn't ask for it.
   */
  public usePastedUid(on: boolean): void {
    this.pasteUid.set(on);
    if (on) {
      this.form.controls.uid.enable();
    } else {
      this.form.controls.uid.disable();
    }
  }

  /** @param access Every page's setting at once (0030); the owner then changes the few that differ. */
  public setAll(access: PageAccess): void {
    this.form.controls.pages.patchValue(
      Object.fromEntries(PAGE_ROWS.map((row) => [row.tab, access])),
    );
    this.form.controls.pages.markAsDirty();
  }

  /** @param manager The manager whose settings to change. */
  public edit(manager: IManager): void {
    fillRoleForm(this.form, manager);
    this.editing.set(manager);
    this.mode.set(RoleFormMode.Editing);
  }

  public closeForm(): void {
    this.mode.set(RoleFormMode.Closed);
    this.editing.set(null);
  }

  /** Saves the form, or reveals its errors. */
  public save(): void {
    this.submits.next();
  }

  /** @param manager The manager to remove, once the owner confirms. */
  public askToRemove(manager: IManager): void {
    this.confirming.set(manager.uid);
  }

  public cancelRemove(): void {
    this.confirming.set(null);
  }

  /** @param manager The manager whose access to take away. */
  public remove(manager: IManager): void {
    this.removals.next(manager);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.roles.managers().pipe(
      tap((managers) => {
        this.setData(managers);
      }),
      catchError((error: unknown) => {
        this.logger.error('Team access failed to load', error);
        this.failed.set(true);
        return EMPTY;
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      this.submits.pipe(
        tap(() => {
          this.form.markAllAsTouched();
        }),
        filter(() => this.form.valid),
        // exhaustMap: a second click while saving is ignored, never a second write or account.
        exhaustMap(() => (this.inviting() ? this.inviteManager() : this.saveManager())),
      ),
      // exhaustMap: likewise for removing.
      this.removals.pipe(exhaustMap((manager) => this.removeManager(manager))),
    );
  }

  /** Adding a manager with their email alone: the account is made for them (0030). */
  private inviting(): boolean {
    return this.mode() === RoleFormMode.Adding && !this.pasteUid();
  }

  /**
   * Makes the manager's account, saves their role under its id, then sends Firebase's email to set
   * their password. If the account can't be made, says why and, where pasting an id is the way out,
   * opens the id's box with the email kept.
   */
  private inviteManager(): Observable<unknown> {
    const email = roleFormValue(this.form).email;
    this.inviteProblem.set('');
    this.saving.set(true);
    return this.accounts.create(email).pipe(
      // switchMap: one account, then its role; nothing is saved if the account wasn't made.
      switchMap((uid) => this.saveManager(uid, TEAM_MESSAGES.invited)),
      // switchMap: the email only once the role is saved, so the link leads somewhere usable.
      switchMap((saved) => (saved ? this.sendInvite(email) : EMPTY)),
      catchError((error: unknown) => {
        const kind = AccountError.kindOf(error);
        this.inviteProblem.set(AccountError.messageOf(error));
        if (kind === AccountErrorKind.EmailTaken || kind === AccountErrorKind.NotAllowed) {
          this.usePastedUid(true);
        }
        return EMPTY;
      }),
      finalize(() => {
        this.saving.set(false);
      }),
    );
  }

  private sendInvite(email: string): Observable<unknown> {
    return this.auth.sendPasswordReset(email, AppRoute.AdminSignIn).pipe(
      catchError(() => {
        this.toasts.show(TEAM_MESSAGES.inviteEmailFailed(email), ToastTone.Error);
        return EMPTY;
      }),
    );
  }

  /**
   * @param uid The account's id: the pasted one, or the one just made.
   * @param message What the owner is told once it's saved.
   * @returns Emits `true` once saved, or `false` when the save failed (already said).
   */
  private saveManager(
    uid?: string,
    message: (email: string) => string = TEAM_MESSAGES.saved,
  ): Observable<boolean> {
    const value = roleFormValue(this.form);
    const now = this.clock.now().toISOString();
    // A change keeps the date they were first added, and when they became a super manager.
    const addedAt = this.editing()?.role.addedAt ?? now;
    const superSince = this.editing()?.role.superManager?.since ?? now;
    this.saving.set(true);
    return this.roles.save(uid ?? value.uid, roleOf(value, addedAt, superSince)).pipe(
      tap((saved) => {
        this.replace(saved.uid, saved);
        this.closeForm();
        this.toasts.show(message(saved.role.email));
      }),
      map(() => true),
      // Inside the exhaustMap, so one failure can't end the stream.
      catchError(() => {
        this.toasts.show(TEAM_MESSAGES.saveFailed, ToastTone.Error);
        return of(false);
      }),
      finalize(() => {
        this.saving.set(false);
      }),
    );
  }

  private removeManager(manager: IManager): Observable<unknown> {
    this.removing.set(true);
    return this.roles.remove(manager.uid).pipe(
      tap(() => {
        this.replace(manager.uid, null);
        this.confirming.set(null);
        this.toasts.show(TEAM_MESSAGES.removed(manager.role.email));
      }),
      catchError(() => {
        this.toasts.show(TEAM_MESSAGES.removeFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.removing.set(false);
      }),
    );
  }

  /** Puts the saved manager in the list, or takes them out when removed. */
  private replace(uid: string, saved: IManager | null): void {
    const others = (this.data() ?? []).filter((manager) => manager.uid !== uid);
    this.setData(saved === null ? others : byEmail([...others, saved]));
  }

  private listed(): ReadonlySet<string> {
    return new Set((this.data() ?? []).map((manager) => manager.uid));
  }
}
