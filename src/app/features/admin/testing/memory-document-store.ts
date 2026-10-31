import { type Observable, defer, of } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import {
  type DocumentFields,
  type DocumentWrite,
  IDocumentStore,
} from '@core/interfaces/i-document-store';

/** An in-memory `IDocumentStore` for specs: documents by path, inspectable and seedable. */
export class MemoryDocumentStore extends IDocumentStore {
  /** Every stored document by path. */
  public readonly documents = new Map<string, DocumentFields>();
  /** Every commit, in order. */
  public readonly commits: (readonly DocumentWrite[])[] = [];

  /** @param seed Documents to start with, by path. */
  public constructor(seed: Readonly<Record<string, DocumentFields>> = {}) {
    super();
    for (const [path, fields] of Object.entries(seed)) {
      this.documents.set(path, fields);
    }
  }

  public read(path: string): Observable<DocumentFields | null> {
    return defer(() => of(this.documents.get(path) ?? null));
  }

  public readAll(collection: string): Observable<ReadonlyMap<string, DocumentFields>> {
    const prefix = `${collection}/`;
    return defer(() =>
      of(
        new Map(
          [...this.documents]
            .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
            .map(([path, fields]) => [path.slice(prefix.length), fields] as const),
        ),
      ),
    );
  }

  public commit(writes: readonly DocumentWrite[]): Observable<void> {
    return defer(() => {
      this.commits.push(writes);
      for (const write of writes) {
        if (write.kind === DocumentWriteKind.Set) {
          this.documents.set(write.path, write.fields);
        } else {
          this.documents.delete(write.path);
        }
      }
      return of(undefined);
    });
  }
}
