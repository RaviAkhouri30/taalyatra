import { Service, inject } from '@angular/core';
import { type Observable, catchError, concatMap, from, last, map, of, switchMap } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentWrite, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { SpeedReportModel, VITALS_COLLECTION, isExpired } from '../models/speed-report.model';

/** Firestore takes at most this many writes in one commit. */
const COMMIT_LIMIT = 500;

/** Reads the visitors' speed reports for the owner, and keeps the collection small (0012). */
@Service()
export class SpeedReportService {
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);

  /** @returns The report over the last 30 days, once reports older than that are removed. */
  public load(): Observable<SpeedReportModel> {
    const now = this.clock.now();
    return this.store.readAll(VITALS_COLLECTION).pipe(
      switchMap((stored) => {
        const entries = [...stored];
        const old = entries.filter(([, report]) => isExpired(report, now));
        const kept = entries.filter(([, report]) => !isExpired(report, now));
        // switchMap: one read, then its cleanup. The answer doesn't depend on the cleanup working.
        return this.remove(old.map(([id]) => id)).pipe(
          map(() => new SpeedReportModel(kept.map(([, report]) => report))),
        );
      }),
    );
  }

  private remove(ids: readonly string[]): Observable<unknown> {
    if (ids.length === 0) {
      return of(undefined);
    }
    const writes = ids.map((id): DocumentWrite => ({
      kind: DocumentWriteKind.Delete,
      path: `${VITALS_COLLECTION}/${id}`,
    }));
    const commits = Array.from({ length: Math.ceil(writes.length / COMMIT_LIMIT) }, (_, index) =>
      writes.slice(index * COMMIT_LIMIT, (index + 1) * COMMIT_LIMIT),
    );
    return from(commits).pipe(
      // concatMap: one commit at a time, in order.
      concatMap((commit) => this.store.commit(commit)),
      last(),
      catchError(() => of(undefined)),
    );
  }
}
