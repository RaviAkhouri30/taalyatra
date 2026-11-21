import { Service, inject } from '@angular/core';
import {
  type Observable,
  catchError,
  concat,
  defer,
  map,
  of,
  shareReplay,
  switchMap,
  timer,
} from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { CLOCK } from '@core/tokens/clock.token';
import { Permissions } from '../models/permissions.model';
import { type IRole, ROLES_COLLECTION, toRole } from '../models/role.model';

/**
 * The longest single wait for a super manager's end: browsers fire a timer longer than about 24.8
 * days at once, so a far end is reached in steps of a day, each judged afresh by the clock.
 */
export const SUPER_END_STEP_MS = 86_400_000;

/**
 * What the signed-in account may do (0019): the owner, fixed by id as in `firestore.rules`
 * (decision 1); a manager, by their record on Team access; or nobody. Read once per sign-in and
 * shared by the guards and every page. A change on Team access reaches a manager's screens when
 * they next open the admin; the rules apply it at once. A super manager's end (0024) is the
 * exception: it emits again at that moment, so their screens drop back without a reload.
 */
@Service()
export class AccessService {
  /** The signed-in account's permissions; emits again when the account changes. */
  public readonly permissions$: Observable<Permissions>;

  private readonly auth = inject(IAuthService);
  private readonly store = inject(IDocumentStore);
  private readonly ownerUid = inject(APP_ENVIRONMENT).adminUid;
  private readonly clock = inject(CLOCK);
  /** One read per account, shared by the guard and the pages, until the next sign-out. */
  private readonly reads = new Map<string, Observable<Permissions>>();

  public constructor() {
    // Assigned here because it reads private fields declared after the public one.
    this.permissions$ = this.auth.user$.pipe(
      // switchMap: a newer account replaces a role read still in flight. Each account has its
      // own read, so a guard never gets the account before's permissions just after a sign-in.
      switchMap((user) => this.readFor(user)),
    );
  }

  private readFor(user: IAuthUser | null): Observable<Permissions> {
    if (user === null) {
      // Signed out: the next sign-in reads the role afresh, with any change the owner made.
      this.reads.clear();
      return of(Permissions.none());
    }
    const cached = this.reads.get(user.uid);
    if (cached) {
      return cached;
    }
    const read = this.permissionsOf(user).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.reads.set(user.uid, read);
    return read;
  }

  private permissionsOf(user: IAuthUser): Observable<Permissions> {
    if (user.uid === this.ownerUid) {
      return of(Permissions.owner(user));
    }
    return this.store.read(`${ROLES_COLLECTION}/${user.uid}`).pipe(
      map((fields) => toRole(fields)),
      // The rules refuse an account that was never added; that's simply no access.
      catchError(() => of(null)),
      // switchMap: one role read, followed by its permissions over time.
      switchMap((role) => (role ? this.managerOverTime(user, role) : of(Permissions.none(user)))),
    );
  }

  /** The manager's permissions now and, for a super manager with an end, once more at the end. */
  private managerOverTime(user: IAuthUser, role: IRole): Observable<Permissions> {
    const permissions = Permissions.manager(user, role, this.clock.now());
    const end = permissions.superEndsAt;
    if (end === null) {
      return of(permissions);
    }
    // concat: the end's permissions only after the wait completes, judged by the clock then.
    return concat(
      of(permissions),
      defer(() => this.waitUntil(end.getTime())).pipe(
        map(() => Permissions.manager(user, role, this.clock.now())),
      ),
    );
  }

  /** Emits once, when the clock reaches `endMs`; a far end is waited for a day at a time. */
  private waitUntil(endMs: number): Observable<void> {
    const left = endMs - this.clock.now().getTime();
    if (left <= 0) {
      return of(undefined);
    }
    // switchMap: each step ends before the next starts, so one timer runs at a time.
    return timer(Math.min(left, SUPER_END_STEP_MS)).pipe(
      switchMap(() => defer(() => this.waitUntil(endMs))),
    );
  }
}
