import { Service, inject } from '@angular/core';
import { type Observable, forkJoin, map, of, switchMap, take } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import {
  type DocumentFields,
  type DocumentWrite,
  IDocumentStore,
} from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { DRAFTS_COLLECTION, type IDraft, draftId } from '@core/interfaces/i-draft';
import { expandCollection, isCollection } from '../models/collection-expander';
import { PUBLISHES_COLLECTION, PUBLISH_HISTORY_LIMIT } from '../models/editor-storage.constants';
import {
  type IPublishRecord,
  type ISelfApproval,
  SELF_APPROVALS_COLLECTION,
} from '../models/i-publish-record';
import { type Permissions } from '../models/permissions.model';
import { AccessService } from './access.service';
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
        ...optionalText(entries, 'by'),
        ...optionalText(entries, 'byEmail'),
        ...optionalText(entries, 'approvedFrom'),
        ...selfApprovalOf(entries.get('selfApproval')),
        ...(entries.get('forOwner') === true ? { forOwner: true } : {}),
      }
    : null;
}

/** `{ selfApproval }` when one is stored, its title and note as text, else nothing. */
function selfApprovalOf(value: unknown): Partial<Pick<IPublishRecord, 'selfApproval'>> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const entries = new Map(Object.entries(value as Record<string, unknown>));
  const text = (key: string): string => {
    const stored = entries.get(key);
    return typeof stored === 'string' ? stored : '';
  };
  return { selfApproval: { title: text('title'), note: text('note') } };
}

/** `{ key: value }` when the stored value is text, else nothing (exact optional properties). */
function optionalText(
  entries: ReadonlyMap<string, unknown>,
  key: 'by' | 'byEmail' | 'approvedFrom',
): Partial<Pick<IPublishRecord, typeof key>> {
  const value = entries.get(key);
  return typeof value === 'string' ? { [key]: value } : {};
}

/** What else a publish does, besides putting the drafts live. */
export interface IPublishExtras {
  /** For an approved change, the email of the manager who sent it. */
  readonly approvedFrom?: string;
  /** For a manager approving their own changes (0023): their title and note. */
  readonly selfApproval?: ISelfApproval;
  /** More writes for the same commit, e.g. answering the request (0019). */
  readonly writes?: readonly DocumentWrite[];
}

/**
 * Publishes drafts and keeps a history to go back to (ADR-0013, 0016 V3). A publish is one atomic
 * commit: live documents, the history record (with who published), removing the drafts and, for
 * the owner, trimming history; the rules never let a manager delete history (0019).
 */
@Service()
export class PublishService {
  private readonly store = inject(IDocumentStore);
  private readonly drafts = inject(DraftService);
  private readonly clock = inject(CLOCK);
  private readonly access = inject(AccessService);

  /**
   * @param drafts The drafts to publish, by document path.
   * @param extras What else the same commit does.
   * @returns The new history record, or `null` when there was nothing to publish.
   */
  public publish(
    drafts: ReadonlyMap<string, IDraft>,
    extras: IPublishExtras = {},
  ): Observable<IPublishRecord | null> {
    const paths = [...drafts.keys()];
    if (paths.length === 0) {
      // Nothing to put live, but the extra writes still apply: an approved request whose drafts
      // are gone is still answered and unlocked.
      const writes = extras.writes ?? [];
      return writes.length === 0 ? of(null) : this.store.commit(writes).pipe(map(() => null));
    }
    // forkJoin: who is publishing, the live versions (kept for undo), the numbered ids of any
    // collection being published (so its unused numbers can be deleted) and the history are
    // independent reads.
    return forkJoin([
      this.access.permissions$.pipe(take(1)),
      forkJoin(paths.map((path) => this.drafts.live(path))),
      forkJoin(paths.map((path) => this.storedIds(path))),
      this.history(),
    ]).pipe(
      // switchMap: one commit per publish, built from what was just read.
      switchMap(([permissions, live, ids, history]) => {
        const record = this.record(paths, live, permissions, extras);
        const existing = new Map(paths.map((path, index) => [path, ids.at(index) ?? []]));
        // Only the owner trims: the rules never let a manager delete history, a super manager's
        // included (0024 D1).
        const trimmed = permissions.isOwner ? history : [];
        return this.store
          .commit([
            ...this.writes(drafts, existing, record, trimmed),
            ...this.markerWrites(record, permissions),
            ...(extras.writes ?? []),
          ])
          .pipe(map(() => record));
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
   * Goes back to how the site was before a publish (0016 V3): every document it, or any later
   * publish, changed gets its version from just before the earliest of them. Into drafts, for the
   * owner to review and publish. Documents that didn't exist then are left as they are.
   *
   * @param record The publish to go back to before.
   * @param history The publish history, newest first.
   * @returns Completes once the drafts are saved.
   */
  public goBack(record: IPublishRecord, history: readonly IPublishRecord[]): Observable<void> {
    const index = history.findIndex((entry) => entry.id === record.id);
    // Newest first, so each older publish overwrites: the oldest one's "before" wins.
    const range = index < 0 ? [record] : history.slice(0, index + 1);
    const before = new Map<string, DocumentFields | null>();
    for (const entry of range) {
      for (const [path, content] of Object.entries(entry.before)) {
        before.set(path, content);
      }
    }
    return this.drafts.saveAll(
      new Map(
        [...before].flatMap(([path, content]) =>
          content === null ? [] : [[path, content] as const],
        ),
      ),
    );
  }

  /** @returns A collection's stored ids; any other document has none to clean up. */
  private storedIds(path: string): Observable<readonly string[]> {
    return isCollection(path)
      ? this.store.readAll(path).pipe(map((documents) => [...documents.keys()]))
      : of([]);
  }

  private record(
    paths: readonly string[],
    live: readonly (DocumentFields | null)[],
    permissions: Permissions,
    extras: IPublishExtras,
  ): IPublishRecord {
    const now = this.clock.now().toISOString();
    return {
      // ':' and '.' aren't allowed in our ids; the result still sorts by time.
      id: now.replace(/[:.]/g, '-'),
      publishedAt: now,
      changed: paths,
      before: Object.fromEntries(paths.map((path, index) => [path, live.at(index) ?? null])),
      by: permissions.uid,
      byEmail: permissions.email,
      ...(extras.approvedFrom === undefined ? {} : { approvedFrom: extras.approvedFrom }),
      ...(extras.selfApproval === undefined ? {} : { selfApproval: extras.selfApproval }),
      // A super manager approving someone's request does it for the owner, who is told (0024 D6).
      ...(extras.approvedFrom !== undefined && permissions.isSuper ? { forOwner: true } : {}),
    };
  }

  /**
   * A self-approved publish's marker (0023 D5): the rules accept the manager's live writes to pages
   * that need approval only when it changes in the same commit and points at this new record.
   */
  private markerWrites(record: IPublishRecord, permissions: Permissions): DocumentWrite[] {
    return record.selfApproval === undefined
      ? []
      : [
          {
            kind: DocumentWriteKind.Set,
            path: `${SELF_APPROVALS_COLLECTION}/${permissions.uid}`,
            fields: { record: record.id, paths: record.changed },
          },
        ];
  }

  private writes(
    drafts: ReadonlyMap<string, IDraft>,
    existing: ReadonlyMap<string, readonly string[]>,
    record: IPublishRecord,
    history: readonly IPublishRecord[],
  ): DocumentWrite[] {
    const { id, ...stored } = record;
    return [
      ...[...drafts.values()].flatMap((draft): DocumentWrite[] =>
        isCollection(draft.path)
          ? expandCollection(draft.path, draft.content, existing.get(draft.path) ?? [])
          : [{ kind: DocumentWriteKind.Set, path: draft.path, fields: draft.content }],
      ),
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
