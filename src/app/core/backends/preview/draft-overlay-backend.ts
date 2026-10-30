import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, catchError, map, of, shareReplay, switchMap, take } from 'rxjs';
import { isFirestoreFields, unwrapListSection } from '@core/backends/firebase/firestore-envelope';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { DRAFTS_COLLECTION, type IDraft, draftsByPath } from '@core/interfaces/i-draft';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';

/** No drafts: what anyone but the signed-in admin gets, and what a failed read falls back to. */
const NO_DRAFTS: ReadonlyMap<string, IDraft> = new Map();

/**
 * Preview mode's backend (ADR-0013): answers reads of drafted documents from the owner's drafts
 * and passes everything else to the real backend, so the real site renders unpublished changes.
 * Created only for `?preview` visits, so public visits never load Auth or read drafts.
 */
export class DraftOverlayBackend implements IHttpBackend {
  private readonly auth = inject(IAuthService);
  private readonly store = inject(IDocumentStore);

  // take(1): one answer about the session. Waiting for it also loads Auth, so Firestore sends the
  // admin's token; firestore.rules refuse drafts to anyone else, which falls back to live content.
  private readonly drafts$: Observable<ReadonlyMap<string, IDraft>> = this.auth.user$.pipe(
    take(1),
    switchMap((user) =>
      user === null ? of(NO_DRAFTS) : this.store.readAll(DRAFTS_COLLECTION).pipe(map(draftsByPath)),
    ),
    catchError(() => of(NO_DRAFTS)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  /** @param inner The real backend. */
  public constructor(private readonly inner: IHttpBackend) {}

  /** A drafted document, answered the way the real backend answers it (lists unwrapped). */
  private static answer<T>(draft: IDraft): HttpResponse<T> {
    const body: unknown = isFirestoreFields(draft.content)
      ? unwrapListSection(draft.content)
      : draft.content;
    return new HttpResponse<T>({ status: HttpStatusCode.Ok, body: body as T });
  }
  public get<T>(path: string): Observable<HttpResponse<T>> {
    const key = path
      .split('/')
      .filter((segment) => segment.length > 0)
      .join('/');
    // switchMap: decide per read once the drafts are known; most reads go to the real backend.
    return this.drafts$.pipe(
      switchMap((drafts) => {
        const draft = drafts.get(key);
        return draft === undefined
          ? this.inner.get<T>(path)
          : of(DraftOverlayBackend.answer<T>(draft));
      }),
    );
  }

  public post<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.inner.post<T>(path, body);
  }

  public put<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.inner.put<T>(path, body);
  }

  public patch<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.inner.patch<T>(path, body);
  }

  public delete<T>(path: string): Observable<HttpResponse<T>> {
    return this.inner.delete<T>(path);
  }
}
