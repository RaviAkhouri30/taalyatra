import { type Observable } from 'rxjs';
import { type DocumentWriteKind } from '@core/enums/document-write-kind.enum';

/** A stored document's fields, as plain JSON. */
export type DocumentFields = Readonly<Record<string, unknown>>;

/** One write in an atomic commit: replace a document whole, or delete it. */
export type DocumentWrite =
  | {
      readonly kind: DocumentWriteKind.Set;
      readonly path: string;
      readonly fields: DocumentFields;
    }
  | { readonly kind: DocumentWriteKind.Delete; readonly path: string };

/**
 * Document storage for the content editor (ADR-0013). Unlike `IHttpBackend`, which serves the
 * public site from a per-visit cache, every read here is fresh, and writes are applied together
 * or not at all. Abstract class, so it doubles as the DI token.
 */
export abstract class IDocumentStore {
  /**
   * @param path A document path, e.g. `home/hero`.
   * @returns The document's current fields, or `null` when it doesn't exist.
   */
  public abstract read(path: string): Observable<DocumentFields | null>;

  /**
   * @param collection A collection path, e.g. `drafts`.
   * @returns Every document in it, by id.
   */
  public abstract readAll(collection: string): Observable<ReadonlyMap<string, DocumentFields>>;

  /**
   * @param writes The writes to apply.
   * @returns Completes once every write is stored; errors (with nothing stored) otherwise.
   */
  public abstract commit(writes: readonly DocumentWrite[]): Observable<void>;
}
