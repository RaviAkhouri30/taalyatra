import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  filter,
  finalize,
  merge,
  tap,
} from 'rxjs';
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
import { type IManager, RoleFormMode, byEmail } from '../models/team-access.model';
import { RolesService } from '../services/roles.service';

/** What the owner is told about Team access's actions. */
export const TEAM_MESSAGES = {
  saved: (email: string) =>
    `${email} is saved. The new settings apply from their next click; their menu changes the next time they open the admin.`,
  saveFailed: 'Couldn’t save the manager. Nothing changed; please try again.',
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
  private readonly toasts = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly clock = inject(CLOCK);
  /** The manager being changed, whose added date is kept. */
  private readonly editing = signal<IManager | null>(null);
  private readonly submits = new Subject<void>();
  private readonly removals = new Subject<IManager>();

  /** Opens an empty form, with the defaults for a new manager. */
  public add(): void {
    resetRoleForm(this.form);
    this.editing.set(null);
    this.mode.set(RoleFormMode.Adding);
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
        // exhaustMap: a second click while saving is ignored, never a second write.
        exhaustMap(() => this.saveManager()),
      ),
      // exhaustMap: likewise for removing.
      this.removals.pipe(exhaustMap((manager) => this.removeManager(manager))),
    );
  }

  private saveManager(): Observable<unknown> {
    const value = roleFormValue(this.form);
    const now = this.clock.now().toISOString();
    // A change keeps the date they were first added, and when they became a super manager.
    const addedAt = this.editing()?.role.addedAt ?? now;
    const superSince = this.editing()?.role.superManager?.since ?? now;
    this.saving.set(true);
    return this.roles.save(value.uid, roleOf(value, addedAt, superSince)).pipe(
      tap((saved) => {
        this.replace(saved.uid, saved);
        this.closeForm();
        this.toasts.show(TEAM_MESSAGES.saved(saved.role.email));
      }),
      // Inside the exhaustMap, so one failure can't end the stream.
      catchError(() => {
        this.toasts.show(TEAM_MESSAGES.saveFailed, ToastTone.Error);
        return EMPTY;
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
