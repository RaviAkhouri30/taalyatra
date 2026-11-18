import { Service, inject } from '@angular/core';
import { type Observable, forkJoin, map, switchMap, take } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import {
  DRAFTS_COLLECTION,
  type IDraft,
  draftId,
  draftsByPath,
  toDraft,
} from '@core/interfaces/i-draft';
import { collapseCollection, isCollection } from '../models/collection-expander';

/**
 * Unpublished changes (ADR-0013): one draft per changed document, holding the whole document as
 * it will be published, shared by the owner and the managers, each draft signed by whoever saved
 * it last (0019). Visitors never read drafts.
 */
@Service()
export class DraftService {
  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);
  private readonly auth = inject(IAuthService);

  /** @returns Every draft, by the path of the document it changes. */
  public drafts(): Observable<ReadonlyMap<string, IDraft>> {
    return this.store.readAll(DRAFTS_COLLECTION).pipe(map(draftsByPath));
  }

  /**
   * @param path A document path.
   * @returns The document as the editor shows it: its draft, else the live version, else `null`.
   */
  public document(path: string): Observable<DocumentFields | null> {
    return forkJoin([
      this.store.read(`${DRAFTS_COLLECTION}/${draftId(path)}`),
      this.live(path),
    ]).pipe(map(([draft, live]) => toDraft(draft)?.content ?? live));
  }

  /**
   * @param path A document or collection path.
   * @returns What's published there; a collection comes as one document holding its list (D15).
   */
  public live(path: string): Observable<DocumentFields | null> {
    return isCollection(path)
      ? this.store.readAll(path).pipe(map((documents) => collapseCollection(documents)))
      : this.store.read(path);
  }

  /**
   * @param path The document the draft changes.
   * @param content The whole document as it will be published.
   * @returns The saved draft.
   */
  public save(path: string, content: DocumentFields): Observable<IDraft> {
    // switchMap: the draft is signed with whoever is signed in when it's saved.
    return this.savedBy().pipe(
      switchMap((savedBy) => {
        const draft: IDraft = { path, content, savedAt: this.clock.now().toISOString(), savedBy };
        return this.store
          .commit([
            {
              kind: DocumentWriteKind.Set,
              path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
              fields: { ...draft },
            },
          ])
          .pipe(map(() => draft));
      }),
    );
  }

  /**
   * @param contents Documents to put back into drafts, by path (from a publish's history).
   * @returns Completes once every draft is saved, together.
   */
  public saveAll(contents: ReadonlyMap<string, DocumentFields>): Observable<void> {
    const savedAt = this.clock.now().toISOString();
    // switchMap: one commit, signed with whoever is signed in.
    return this.savedBy().pipe(
      switchMap((savedBy) =>
        this.store.commit(
          [...contents].map(([path, content]) => ({
            kind: DocumentWriteKind.Set,
            path: `${DRAFTS_COLLECTION}/${draftId(path)}`,
            fields: { path, content, savedAt, savedBy },
          })),
        ),
      ),
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

  /** @returns The signed-in account's id, once (the editor is only open when signed in). */
  private savedBy(): Observable<string> {
    return this.auth.user$.pipe(
      take(1),
      map((user) => user?.uid ?? ''),
    );
  }
}
