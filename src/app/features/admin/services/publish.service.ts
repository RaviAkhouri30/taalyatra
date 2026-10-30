import { Service, inject } from '@angular/core';
import { type Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import {
  type DocumentFields,
  type DocumentWrite,
  IDocumentStore,
} from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import {
  DRAFTS_COLLECTION,
  PUBLISHES_COLLECTION,
  PUBLISH_HISTORY_LIMIT,
  draftId,
} from '../models/editor-storage.constants';
import { type IDraft } from '../models/i-draft';
import { type IPublishRecord } from '../models/i-publish-record';
import { DraftService } from './draft.service';

/** A stored history record, or `null` when the stored data isn't one. */
function toRecord(id: string, fields: DocumentFields): IPublishRecord | null {
  const entries = new Map(Object.entries(fields));
  const publishedAt = entries.get('publishedAt');
  const changed = entries.get('changed');
  const before = entries.get('before');
  return typeof publishedAt === 'string' &&
    Array.isArray(changed) &&
    typeof before === 'object' &&
    before !== null
    ? {
        id,
        publishedAt,
        changed: changed.filter((path): path is string => typeof path === 'string'),
        before: before as IPublishRecord['before'],
      }
    : null;
}

/**
 * Publishes the owner's drafts and keeps a history to undo from (ADR-0013). A publish is one
 * atomic commit: live documents, the history record, removing the drafts and trimming history.
 */
@Service()
export class PublishService {
  private readonly store = inject(IDocumentStore);
  private readonly drafts = inject(DraftService);
  private readonly clock = inject(CLOCK);

  /**
   * @param drafts The drafts to publish, by document path.
   * @returns The new history record, or `null` when there was nothing to publish.
   */
  public publish(drafts: ReadonlyMap<string, IDraft>): Observable<IPublishRecord | null> {
    const paths = [...drafts.keys()];
    if (paths.length === 0) {
      return of(null);
    }
    // forkJoin: the current live versions (kept for undo) and the history are independent reads.
    return forkJoin([forkJoin(paths.map((path) => this.store.read(path))), this.history()]).pipe(
      // switchMap: one commit per publish, built from what was just read.
      switchMap(([live, history]) => {
        const record = this.record(paths, live);
        return this.store.commit(this.writes(drafts, record, history)).pipe(map(() => record));
      }),
    );
  }

  /** @returns The publish history, newest first. */
  public history(): Observable<readonly IPublishRecord[]> {
    return this.store.readAll(PUBLISHES_COLLECTION).pipe(
      map((stored) =>
        [...stored]
          .flatMap(([id, fields]) => {
            const record = toRecord(id, fields);
            return record === null ? [] : [record];
          })
          .sort((a, b) => b.id.localeCompare(a.id)),
      ),
    );
  }

  /**
   * Puts the versions from before a publish back into drafts, for the owner to review and
   * publish. Documents that didn't exist before are left as they are.
   *
   * @param record The publish to undo.
   * @returns Completes once the drafts are saved.
   */
  public restore(record: IPublishRecord): Observable<void> {
    const contents = new Map(
      Object.entries(record.before).flatMap(([path, content]) =>
        content === null ? [] : [[path, content] as const],
      ),
    );
    return this.drafts.saveAll(contents);
  }

  private record(
    paths: readonly string[],
    live: readonly (DocumentFields | null)[],
  ): IPublishRecord {
    const now = this.clock.now().toISOString();
    return {
      // ':' and '.' aren't allowed in our ids; the result still sorts by time.
      id: now.replace(/[:.]/g, '-'),
      publishedAt: now,
      changed: paths,
      before: Object.fromEntries(paths.map((path, index) => [path, live.at(index) ?? null])),
    };
  }

  private writes(
    drafts: ReadonlyMap<string, IDraft>,
    record: IPublishRecord,
    history: readonly IPublishRecord[],
  ): DocumentWrite[] {
    const { id, ...stored } = record;
    return [
      ...[...drafts.values()].map((draft): DocumentWrite => ({
        kind: DocumentWriteKind.Set,
        path: draft.path,
        fields: draft.content,
      })),
      { kind: DocumentWriteKind.Set, path: `${PUBLISHES_COLLECTION}/${id}`, fields: { ...stored } },
      ...[...drafts.keys()].map((path): DocumentWrite => ({
        kind: DocumentWriteKind.Delete,
        path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
      })),
      // The new record plus the newest older ones make up the limit; the rest go.
      ...history.slice(PUBLISH_HISTORY_LIMIT - 1).map((old): DocumentWrite => ({
        kind: DocumentWriteKind.Delete,
        path: `${PUBLISHES_COLLECTION}/${old.id}`,
      })),
    ];
  }
}
