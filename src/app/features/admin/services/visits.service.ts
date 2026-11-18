import { Service, inject } from '@angular/core';
import {
  type Observable,
  catchError,
  concatMap,
  defaultIfEmpty,
  forkJoin,
  from,
  last,
  map,
  of,
  switchMap,
} from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentWrite, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { siteDay } from '../models/site-days';
import {
  type IVisitDay,
  type IVisitTidy,
  VISITS_COLLECTION,
  VISIT_DAYS_COLLECTION,
  planTidy,
} from '../models/visit-days';

/** Firestore takes at most this many writes in one commit. */
const COMMIT_LIMIT = 500;

/** Every day's visits, and today, in India. */
export interface IVisitHistory {
  readonly days: readonly IVisitDay[];
  readonly today: string;
}

/**
 * Reads the anonymous visit counts (0018 V11), adding each finished day's single visits up into
 * one `visitDays` document and removing them, so the counts stay one small document per day.
 */
@Service()
export class VisitsService {
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);

  /** @returns Every day's visits since counting began, once finished days are tidied. */
  public load(): Observable<IVisitHistory> {
    const today = siteDay(this.clock.now().getTime());
    // forkJoin: two independent reads, both needed to plan.
    return forkJoin([
      this.store.readAll(VISITS_COLLECTION),
      this.store.readAll(VISIT_DAYS_COLLECTION),
    ]).pipe(
      map(([visits, stored]) => planTidy(visits, stored, today)),
      // switchMap: one read, then its tidying. The answer doesn't depend on the tidying working.
      switchMap((tidy) => this.tidy(tidy).pipe(map(() => ({ days: tidy.days, today })))),
    );
  }

  private tidy(plan: IVisitTidy): Observable<unknown> {
    return from([...plan.removals]).pipe(
      // concatMap: one day at a time. Each day's failure is its own: another device may have
      // stored that day first, and the next day still gets tidied.
      concatMap(([day, ids]) =>
        this.tidyDay(
          plan.newDays.find((entry) => entry.day === day),
          day,
          ids,
        ).pipe(catchError(() => of(undefined))),
      ),
      // Nothing to tidy still answers.
      defaultIfEmpty(undefined),
      last(),
    );
  }

  private tidyDay(
    added: IVisitDay | undefined,
    day: string,
    ids: readonly string[],
  ): Observable<unknown> {
    // concatMap: in order, and an error stops the rest, so no single visit is removed before
    // its day's document is stored.
    return from(this.commitsFor(added, day, ids)).pipe(
      concatMap((writes) => this.store.commit(writes)),
    );
  }

  /**
   * The day's document goes in the same commit as its first removals: if it's refused, those
   * single visits stay, and the next visit to the page tries again.
   */
  private commitsFor(
    added: IVisitDay | undefined,
    day: string,
    ids: readonly string[],
  ): DocumentWrite[][] {
    const writes: DocumentWrite[] = [
      ...(added
        ? [
            {
              kind: DocumentWriteKind.Set,
              path: `${VISIT_DAYS_COLLECTION}/${day}`,
              fields: { total: added.total, pages: added.pages, devices: added.devices },
            } as const,
          ]
        : []),
      ...ids.map(
        (id) => ({ kind: DocumentWriteKind.Delete, path: `${VISITS_COLLECTION}/${id}` }) as const,
      ),
    ];
    return Array.from({ length: Math.ceil(writes.length / COMMIT_LIMIT) }, (_, index) =>
      writes.slice(index * COMMIT_LIMIT, (index + 1) * COMMIT_LIMIT),
    );
  }
}
