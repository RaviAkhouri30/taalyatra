import { Service, inject } from '@angular/core';
import { type Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { Permissions } from '../models/permissions.model';
import { ROLES_COLLECTION, toRole } from '../models/role.model';

/**
 * What the signed-in account may do (0019): the owner, fixed by id as in `firestore.rules`
 * (decision 1); a manager, by their record on Team access; or nobody. Read once per sign-in and
 * shared by the guards and every page. A change on Team access reaches a manager's screens when
 * they next open the admin; the rules apply it at once.
 */
@Service()
export class AccessService {
  /** The signed-in account's permissions; emits again when the account changes. */
  public readonly permissions$: Observable<Permissions>;

  private readonly auth = inject(IAuthService);
  private readonly store = inject(IDocumentStore);
  private readonly ownerUid = inject(APP_ENVIRONMENT).adminUid;
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
      map((fields) => {
        const role = toRole(fields);
        return role ? Permissions.manager(user, role) : Permissions.none(user);
      }),
      // The rules refuse an account that was never added; that's simply no access.
      catchError(() => of(Permissions.none(user))),
    );
  }
}
