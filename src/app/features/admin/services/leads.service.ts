import { Service, inject } from '@angular/core';
import { type Observable, Subject, map, tap } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { LEADS_COLLECTION, Lead, type LeadStatus, newestFirst } from '../models/lead.model';

/**
 * The proposals visitors sent, for the Leads page (0018 V12): read, a status changed, or one
 * removed for good. Nothing else about a lead can change (`firestore.rules`).
 */
@Service()
export class LeadsService {
  /** Emits after a lead changed or was removed, so counts elsewhere (menu, dashboard) update. */
  public readonly changed$: Observable<void>;

  private readonly changes = new Subject<void>();
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);

  public constructor() {
    // Assigned here because it reads `changes`, a private field declared after the public one.
    this.changed$ = this.changes.asObservable();
  }

  /** @returns Every lead, newest first. */
  public leads(): Observable<Lead[]> {
    return this.store
      .readAll(LEADS_COLLECTION)
      .pipe(map((stored) => newestFirst([...stored].map(([id, fields]) => new Lead(id, fields)))));
  }

  /**
   * @param lead The lead.
   * @param status Its new status.
   * @param by The changer's email, which the rules require to be the signed-in account's (0022).
   * @returns The lead as stored now.
   */
  public setStatus(lead: Lead, status: LeadStatus, by: string): Observable<Lead> {
    // The whole document, exactly as read, plus the status: the rules accept a change to the
    // status, its time and its signer only, so nothing the visitor sent can be altered from here.
    const fields = {
      ...lead.fields,
      status,
      statusAt: this.clock.now().toISOString(),
      statusBy: by,
    };
    return this.store
      .commit([{ kind: DocumentWriteKind.Set, path: `${LEADS_COLLECTION}/${lead.id}`, fields }])
      .pipe(
        map(() => new Lead(lead.id, fields)),
        tap(() => {
          this.changes.next();
        }),
      );
  }

  /**
   * Removes a lead for good, e.g. for a customer who asks to be forgotten (0018 decision 7).
   * @param lead The lead.
   * @returns Completes once it's gone.
   */
  public remove(lead: Lead): Observable<void> {
    return this.store
      .commit([{ kind: DocumentWriteKind.Delete, path: `${LEADS_COLLECTION}/${lead.id}` }])
      .pipe(
        tap(() => {
          this.changes.next();
        }),
      );
  }
}
