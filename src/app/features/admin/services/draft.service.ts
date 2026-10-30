import { Service, inject } from '@angular/core';
import { type Observable, forkJoin, map } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { DRAFTS_COLLECTION, draftId } from '../models/editor-storage.constants';
import { type IDraft } from '../models/i-draft';

function isFields(value: unknown): value is DocumentFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A stored draft, or `null` when the stored data isn't one (it is then ignored). */
function toDraft(fields: DocumentFields | null): IDraft | null {
  const entries = new Map(Object.entries(fields ?? {}));
  const path = entries.get('path');
  const content = entries.get('content');
  const savedAt = entries.get('savedAt');
  return typeof path === 'string' && isFields(content) && typeof savedAt === 'string'
    ? { path, content, savedAt }
    : null;
}

/**
 * The owner's unpublished changes (ADR-0013): one draft per changed document, holding the whole
 * document as it will be published. Visitors never read drafts.
 */
@Service()
export class DraftService {
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);

  /** @returns Every draft, by the path of the document it changes. */
  public drafts(): Observable<ReadonlyMap<string, IDraft>> {
    return this.store.readAll(DRAFTS_COLLECTION).pipe(
      map(
        (stored) =>
          new Map(
            [...stored.values()].flatMap((fields) => {
              const draft = toDraft(fields);
              return draft === null ? [] : [[draft.path, draft] as const];
            }),
          ),
      ),
    );
  }

  /**
   * @param path A document path.
   * @returns The document as the editor shows it: its draft, else the live version, else `null`.
   */
  public document(path: string): Observable<DocumentFields | null> {
    return forkJoin([
      this.store.read(`${DRAFTS_COLLECTION}/${draftId(path)}`),
      this.store.read(path),
    ]).pipe(map(([draft, live]) => toDraft(draft)?.content ?? live));
  }

  /**
   * @param path The document the draft changes.
   * @param content The whole document as it will be published.
   * @returns The saved draft.
   */
  public save(path: string, content: DocumentFields): Observable<IDraft> {
    const draft: IDraft = { path, content, savedAt: this.clock.now().toISOString() };
    return this.store
      .commit([
        {
          kind: DocumentWriteKind.Set,
          path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
          fields: { ...draft },
        },
      ])
      .pipe(map(() => draft));
  }

  /**
   * @param contents Documents to put back into drafts, by path (from a publish's history).
   * @returns Completes once every draft is saved, together.
   */
  public saveAll(contents: ReadonlyMap<string, DocumentFields>): Observable<void> {
    const savedAt = this.clock.now().toISOString();
    return this.store.commit(
      [...contents].map(([path, content]) => ({
        kind: DocumentWriteKind.Set,
        path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
        fields: { path, content, savedAt },
      })),
    );
  }

  /**
   * @param paths The documents whose drafts to throw away.
   * @returns Completes once they are all gone.
   */
  public discard(paths: readonly string[]): Observable<void> {
    return this.store.commit(
      paths.map((path) => ({
        kind: DocumentWriteKind.Delete,
        path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
      })),
    );
  }
}
