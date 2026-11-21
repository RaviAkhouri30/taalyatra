import { Service, inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of, switchMap, take } from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type IDraft } from '@core/interfaces/i-draft';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { type Permissions } from '../models/permissions.model';
import { Review, documentTitles } from '../models/review.model';
import { SECTIONS_WITH_TABS } from '../schemas/editor-tabs';
import { AccessService } from './access.service';
import { ApprovalService } from './approval.service';
import { DraftService } from './draft.service';
import { RolesService } from './roles.service';

const titleOf = documentTitles(SECTIONS_WITH_TABS);

/**
 * Everything needed to review unpublished changes (0019): the drafts, who made them, what
 * publishing each does for the signed-in account, and the approval requests. Shared by Review &
 * publish and the publish bar, so both treat a change the same way.
 */
@Service()
export class ReviewService {
  private readonly access = inject(AccessService);
  private readonly drafts = inject(DraftService);
  private readonly approvals = inject(ApprovalService);
  private readonly roles = inject(RolesService);
  private readonly ownerUid = inject(APP_ENVIRONMENT).adminUid;

  /** @returns The review, read afresh. */
  public review(): Observable<Review> {
    return this.access.permissions$.pipe(
      take(1),
      // switchMap: the reads depend on who is signed in.
      switchMap((permissions) =>
        this.drafts.drafts().pipe(
          // switchMap: a manager's shared drafts are compared with what's live.
          switchMap((drafts) =>
            forkJoin([
              this.requests(),
              this.live(permissions, drafts),
              this.emails(permissions),
            ]).pipe(
              map(
                ([requests, live, emails]) =>
                  new Review(
                    { permissions, drafts, requests, live, emails, ownerUid: this.ownerUid },
                    titleOf,
                  ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  private requests(): ReturnType<ApprovalService['requests']> {
    // Before the 2.0.0 rules are live they're refused: that's no requests, not a broken page.
    return this.approvals.requests().pipe(catchError(() => of([])));
  }

  /** What's live for each of a manager's drafts; the owner publishes anything, so needs none. */
  private live(
    permissions: Permissions,
    drafts: ReadonlyMap<string, IDraft>,
  ): Observable<ReadonlyMap<string, DocumentFields | null>> {
    const paths = [...drafts.keys()].filter((path) => permissions.canSeePath(path));
    if (permissions.actsAsOwner || paths.length === 0) {
      return of(new Map());
    }
    // forkJoin: independent reads, one per document.
    return forkJoin(paths.map((path) => this.drafts.live(path))).pipe(
      map((live) => new Map(paths.map((path, index) => [path, live.at(index) ?? null]))),
    );
  }

  /**
   * Managers' emails: the owner and a super manager read them (0024); a manager may only read their
   * own record.
   */
  private emails(permissions: Permissions): Observable<ReadonlyMap<string, string>> {
    if (!permissions.actsAsOwner) {
      return of(new Map());
    }
    return this.roles.managers().pipe(
      map((managers) => new Map(managers.map((manager) => [manager.uid, manager.role.email]))),
      catchError(() => of(new Map<string, string>())),
    );
  }
}
