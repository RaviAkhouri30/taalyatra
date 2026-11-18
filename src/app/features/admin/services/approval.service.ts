import { Service, inject } from '@angular/core';
import { type Observable, Subject, map, switchMap, take, tap } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentWrite, IDocumentStore } from '@core/interfaces/i-document-store';
import { type IDraft, draftId } from '@core/interfaces/i-draft';
import { CLOCK } from '@core/tokens/clock.token';
import {
  APPROVALS_COLLECTION,
  ApprovalStatus,
  type IApproval,
  LOCKS_COLLECTION,
  answeredFields,
  sentFields,
  toApproval,
} from '../models/approval.model';
import { type Permissions } from '../models/permissions.model';
import { AccessService } from './access.service';
import { PublishService } from './publish.service';

/**
 * Changes a manager sends for the owner's approval (0019 V5): send, withdraw, approve (it goes
 * live) and send back. Each is one commit, so a request and its drafts' locks never disagree.
 */
@Service()
export class ApprovalService {
  /** Emits after a request was sent or answered, so badges and lists update. */
  public readonly changed$: Observable<void>;

  private readonly changes = new Subject<void>();
  private readonly store = inject(IDocumentStore);
  private readonly access = inject(AccessService);
  private readonly publishes = inject(PublishService);
  private readonly clock = inject(CLOCK);

  public constructor() {
    // Assigned here because it reads `changes`, a private field declared after the public one.
    this.changed$ = this.changes.asObservable();
  }

  /** @returns Every request, newest first. */
  public requests(): Observable<IApproval[]> {
    return this.store.readAll(APPROVALS_COLLECTION).pipe(
      map((stored) =>
        [...stored]
          .flatMap(([id, fields]) => {
            const approval = toApproval(id, fields);
            return approval ? [approval] : [];
          })
          .sort((first, second) => second.sentAt.localeCompare(first.sentAt)),
      ),
    );
  }

  /**
   * Sends drafts for approval, locking them for the manager until it's answered (decision 5).
   * @param paths The documents whose drafts to send.
   * @param note What the manager wants the owner to know, or empty.
   * @returns Completes once it's sent.
   */
  public send(paths: readonly string[], note: string): Observable<void> {
    return this.access.permissions$.pipe(
      take(1),
      // switchMap: one commit, in the signed-in manager's name.
      switchMap((permissions) => {
        const approval = this.newRequest(permissions, paths, note);
        return this.store.commit([
          {
            kind: DocumentWriteKind.Set,
            path: this.pathOf(approval),
            fields: sentFields(approval),
          },
          ...paths.map((path): DocumentWrite => ({
            kind: DocumentWriteKind.Set,
            path: `${LOCKS_COLLECTION}/${draftId(path)}`,
            fields: { approval: approval.id },
          })),
        ]);
      }),
      tap(() => {
        this.changes.next();
      }),
    );
  }

  /**
   * Takes a waiting request back, so the manager can edit its drafts again.
   * @param approval The request.
   * @returns Completes once it's gone.
   */
  public withdraw(approval: IApproval): Observable<void> {
    return this.run([
      { kind: DocumentWriteKind.Delete, path: this.pathOf(approval) },
      ...this.unlocks(approval),
    ]);
  }

  /**
   * Removes an answered request from the manager's list.
   * @param approval The request.
   * @returns Completes once it's gone.
   */
  public dismiss(approval: IApproval): Observable<void> {
    return this.run([{ kind: DocumentWriteKind.Delete, path: this.pathOf(approval) }]);
  }

  /**
   * Publishes a request's drafts, with any change the owner made to them, and marks it approved.
   * @param approval The request.
   * @param drafts Every draft, by document path; only the request's are published.
   * @returns Completes once it's live.
   */
  public approve(approval: IApproval, drafts: ReadonlyMap<string, IDraft>): Observable<void> {
    const chosen = new Map([...drafts].filter(([path]) => approval.paths.includes(path)));
    const answered = this.answered(approval, ApprovalStatus.Approved, '');
    return this.publishes
      .publish(chosen, {
        approvedFrom: approval.email,
        writes: [
          {
            kind: DocumentWriteKind.Set,
            path: this.pathOf(answered),
            fields: answeredFields(answered),
          },
          ...this.unlocks(approval),
        ],
      })
      .pipe(
        map(() => undefined),
        tap(() => {
          this.changes.next();
        }),
      );
  }

  /**
   * Returns a request to the manager with a reason; its drafts are theirs to edit again.
   * @param approval The request.
   * @param reason Why, for the manager.
   * @returns Completes once it's answered.
   */
  public sendBack(approval: IApproval, reason: string): Observable<void> {
    const answered = this.answered(approval, ApprovalStatus.SentBack, reason.trim());
    return this.run([
      {
        kind: DocumentWriteKind.Set,
        path: this.pathOf(answered),
        fields: answeredFields(answered),
      },
      ...this.unlocks(approval),
    ]);
  }

  private newRequest(permissions: Permissions, paths: readonly string[], note: string): IApproval {
    const sentAt = this.clock.now().toISOString();
    return {
      // ':' and '.' aren't allowed in our ids; the account keeps two managers' apart.
      id: `${sentAt.replace(/[:.]/g, '-')}-${permissions.uid}`,
      by: permissions.uid,
      email: permissions.email,
      paths,
      note: note.trim(),
      sentAt,
      status: ApprovalStatus.Waiting,
      answer: '',
      answeredAt: '',
    };
  }

  private answered(approval: IApproval, status: ApprovalStatus, answer: string): IApproval {
    return { ...approval, status, answer, answeredAt: this.clock.now().toISOString() };
  }

  private run(writes: readonly DocumentWrite[]): Observable<void> {
    return this.store.commit(writes).pipe(
      tap(() => {
        this.changes.next();
      }),
    );
  }

  private pathOf(approval: IApproval): string {
    return `${APPROVALS_COLLECTION}/${approval.id}`;
  }

  private unlocks(approval: IApproval): DocumentWrite[] {
    return approval.paths.map((path) => ({
      kind: DocumentWriteKind.Delete,
      path: `${LOCKS_COLLECTION}/${draftId(path)}`,
    }));
  }
}
