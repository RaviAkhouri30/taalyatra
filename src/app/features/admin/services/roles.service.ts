import { Service, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { type IRole, ROLES_COLLECTION, roleFields, toRole } from '../models/role.model';
import { type IManager, byEmail } from '../models/team-access.model';

/**
 * The managers on Team access (0019): listed, added or changed, and removed. Only the owner can
 * do any of it (`firestore.rules`), and never to their own account.
 */
@Service()
export class RolesService {
  private readonly store = inject(IDocumentStore);

  /** @returns Every manager, by email; a damaged record is left out. */
  public managers(): Observable<IManager[]> {
    return this.store.readAll(ROLES_COLLECTION).pipe(
      map((stored) =>
        byEmail(
          [...stored].flatMap(([uid, fields]) => {
            const role = toRole(fields);
            return role ? [{ uid, role }] : [];
          }),
        ),
      ),
    );
  }

  /**
   * Adds a manager, or replaces their settings. The rules apply it on their next click.
   * @param uid Their account id.
   * @param role What they may do.
   * @returns The manager as stored.
   */
  public save(uid: string, role: IRole): Observable<IManager> {
    return this.store
      .commit([{ kind: DocumentWriteKind.Set, path: this.pathOf(uid), fields: roleFields(role) }])
      .pipe(map(() => ({ uid, role })));
  }

  /**
   * Takes a manager's access away. Their account stays in Firebase, with no access; their drafts
   * and requests stay for the owner to publish or discard.
   * @param uid Their account id.
   * @returns Completes once it's gone.
   */
  public remove(uid: string): Observable<void> {
    return this.store.commit([{ kind: DocumentWriteKind.Delete, path: this.pathOf(uid) }]);
  }

  private pathOf(uid: string): string {
    return `${ROLES_COLLECTION}/${uid}`;
  }
}
