import { Service, inject } from '@angular/core';
import { type Observable, defer, map, shareReplay } from 'rxjs';
import { type DocumentFields, type DocumentWrite } from '@core/interfaces/i-document-store';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { LocalStoreService } from '@core/services/local-store.service';
import { withoutOrder } from '@core/backends/firebase/firestore-envelope';
import { FIRESTORE_ORDER_FIELD } from '@core/backends/firebase/firestore.constants';

type FakeNode = Readonly<Record<string, unknown>>;

/** The numbered ids run 001, 002…, as the seed script stores them. */
const ID_DIGITS = 3;

/** Where the Fake backend keeps written documents between reloads (development and e2e only). */
export const FAKE_OVERLAY_STORAGE_KEY = 'taal-yatra.fake-db.overlay';

/**
 * The Fake backend's database: `fake-db.json`, plus the documents written since, which are kept in
 * `localStorage` (through `LocalStoreService`). `FakeHttpsService` and `FakeDocumentStore` share it, so drafts, publishes and the
 * preview behave like Firestore in development and in the deterministic e2e suite.
 */
@Service()
export class FakeDataStore {
  // The dynamic import is a Promise; it is wrapped with defer() here, inside the adapter only
  // (CLAUDE.md §7), and cached so the file is fetched once.
  private readonly base$: Observable<FakeNode> = defer(() => import('./fake-db.json')).pipe(
    map((module) => module.default as FakeNode),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  private readonly localStore = inject(LocalStoreService);

  /** Written documents by path; `null` marks a deleted one. */
  private readonly overlay = new Map<string, DocumentFields | null>(
    FakeDataStore.restore(this.localStore.get(FAKE_OVERLAY_STORAGE_KEY)),
  );

  private static segments(path: string): string[] {
    return path.split('/').filter((segment) => segment.length > 0);
  }

  private static child(node: unknown, segment: string): unknown {
    return typeof node === 'object' && node !== null
      ? new Map(Object.entries(node)).get(segment)
      : undefined;
  }

  /** Saved data may be missing or unreadable: start from the fake database then. */
  private static restore(saved: string | null): [string, DocumentFields | null][] {
    try {
      const entries: unknown = JSON.parse(saved ?? '[]');
      return Array.isArray(entries) ? (entries as [string, DocumentFields | null][]) : [];
    } catch {
      return [];
    }
  }

  /**
   * @param path A document or collection path.
   * @returns What is stored there (written documents first), or `undefined` when nothing is. A
   *   collection answers with its documents as a list in order, as the Firestore adapter does.
   */
  public read(path: string): Observable<unknown> {
    return this.node(path).pipe(
      map((node) => {
        const key = FakeDataStore.segments(path).join('/');
        return Array.isArray(node) && this.hasWritesUnder(key)
          ? this.listWithWrites(key, node)
          : node;
      }),
    );
  }

  /**
   * @param collection A collection path.
   * @returns Its documents by id, written documents included and deleted ones left out.
   */
  public children(collection: string): Observable<ReadonlyMap<string, unknown>> {
    const key = FakeDataStore.segments(collection).join('/');
    return this.node(collection).pipe(map((node) => this.documentsIn(key, node)));
  }

  /** @param writes Applied together, then saved for the next reload. */
  public apply(writes: readonly DocumentWrite[]): void {
    for (const write of writes) {
      const key = FakeDataStore.segments(write.path).join('/');
      this.overlay.set(key, write.kind === DocumentWriteKind.Set ? write.fields : null);
    }
    this.persist();
  }

  private node(path: string): Observable<unknown> {
    const key = FakeDataStore.segments(path).join('/');
    return this.base$.pipe(
      map((base) =>
        this.overlay.has(key)
          ? (this.overlay.get(key) ?? undefined)
          : FakeDataStore.segments(path).reduce<unknown>(
              (node, segment) => FakeDataStore.child(node, segment),
              base,
            ),
      ),
    );
  }

  private documentsIn(key: string, node: unknown): Map<string, unknown> {
    const documents = new Map(this.baseEntries(node));
    const prefix = `${key}/`;
    for (const [path, fields] of this.overlay) {
      const id = path.slice(prefix.length);
      if (path.startsWith(prefix) && !id.includes('/')) {
        this.setOrDelete(documents, id, fields);
      }
    }
    return documents;
  }

  private baseEntries(node: unknown): [string, unknown][] {
    if (Array.isArray(node)) {
      // A list in the database stands for numbered documents, as the seed script stores it.
      return node.map((item: unknown, index) => [
        String(index + 1).padStart(ID_DIGITS, '0'),
        { ...(item as FakeNode), [FIRESTORE_ORDER_FIELD]: index },
      ]);
    }
    return typeof node === 'object' && node !== null ? Object.entries(node) : [];
  }

  private hasWritesUnder(key: string): boolean {
    return [...this.overlay.keys()].some((path) => path.startsWith(`${key}/`));
  }

  private listWithWrites(key: string, node: readonly unknown[]): unknown[] {
    const order = (fields: unknown): number =>
      Number(new Map(Object.entries(fields as FakeNode)).get(FIRESTORE_ORDER_FIELD) ?? 0);
    return [...this.documentsIn(key, node).values()]
      .sort((first, second) => order(first) - order(second))
      .map((fields) => withoutOrder(fields as FakeNode));
  }

  private setOrDelete(
    documents: Map<string, unknown>,
    id: string,
    fields: DocumentFields | null,
  ): void {
    if (fields === null) {
      documents.delete(id);
    } else {
      documents.set(id, fields);
    }
  }

  private persist(): void {
    // LocalStoreService ignores a full or blocked storage: the writes still hold for this visit.
    this.localStore.set(FAKE_OVERLAY_STORAGE_KEY, JSON.stringify([...this.overlay]));
  }
}
