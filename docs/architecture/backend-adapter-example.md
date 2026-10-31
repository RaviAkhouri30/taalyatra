# Backend adapter example (canonical)

CLAUDE.md §3 asks for a canonical example of the port → adapter → factory pattern. The chosen
example (approved 2026-10-28) is the Firestore adapter from the reference project,
`Resume3.0/src/app/shared-module/services/firebase-backend.service.ts`, reproduced below **as
reference only**. It predates this project's rules, so don't copy it as-is. Follow the porting
table instead. The Taal Yatra implementation is
`src/app/core/backends/firebase/firebase-backend.service.ts` ([ADR-0009](adr/0009-firestore-data-adapter.md)).

## Porting table

| Resume3.0                                          | Taal Yatra                                                                      | Why                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `from(getDoc(ref))`                                | `defer(() => gateway.getDocument(segments))`                                    | `from` runs eagerly; §7 requires `defer`                        |
| `firebase/firestore`, imported eagerly             | `firebase/firestore/lite`, loaded by `import()` on first request                | Bundle budget, Lighthouse ≥ 95                                  |
| `@Service()` singleton + `FirebaseDatabaseService` | Plain class created by `httpBackendFactory`; SDK set-up inside the lazy gateway | One adapter per port, chosen by factory                         |
| Envelope key `items`                               | Envelope key `_items`                                                           | `home/experiences` and `home/faq` already have an `items` field |
| Fixed `resumes/{uid}/resume/{section}` paths       | Two segments → document, one segment → collection sorted by `order`             | Generic, mirrors `ApiEndpoint`                                  |
| `body: any`, `err: any`                            | `unknown` + type guards                                                         | §8: no `any`                                                    |
| Every error → `500`                                | Firebase code → status map (`403`, `404`, `503`, …)                             | Callers can tell failures apart                                 |
| Auth check inside the adapter (`401`)              | Enforced by `firestore.rules`; `permission-denied` → `403`                      | Security lives in rules, not the client                         |
| Missing doc → `404` with body `{}`                 | `404` with no body                                                              | `ApiBaseService` filters null bodies                            |

## Reference code (Resume3.0, verbatim)

```ts
import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, from, map, Observable, of } from 'rxjs';
import { IHttpBackend } from '../interfaces/i-http-backend';
import { addDoc, collection, doc, Firestore, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseDatabaseService } from './firebase-database.service';

/**
 * Firestore-backed implementation of the application HTTP contract.
 *
 * This adapter translates the app's abstract backend operations to Firestore
 * document reads and writes so feature services stay unaware of the storage layer.
 */
@Service()
export class FirebaseBackendService implements IHttpBackend {
  private readonly db: Firestore;
  private readonly fd: FirebaseDatabaseService = inject(FirebaseDatabaseService);

  constructor() {
    // Resolve the shared Firestore instance from the Firebase bootstrap service.
    this.db = this.fd.fireStore;
  }

  /**
   * Converts an endpoint into the document path used by Firestore.
   *
   * The application endpoint is intentionally aligned with the database hierarchy:
   * `resumes/{userId}/resume/{section}`. Keeping the complete path is important because
   * the user document scopes every resume section to its owner. Array sections are
   * stored as an `{ items: [...] }` document and unwrapped after reading.
   */
  private parseUrl(url: string): string[] {
    const normalizedUrl = url
      .replace(/^https?:\/\//i, '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');
    const segments = normalizedUrl.split('/').filter((segment) => segment.trim() !== '');

    if (segments.length < 4 || segments[0] !== 'resumes' || segments[2] !== 'resume') {
      throw new Error(`Invalid resume URL: ${url}. Expected resumes/{userId}/resume/{section}.`);
    }

    return segments;
  }

  /** Reads a document from Firestore and wraps the result in Angular's HttpResponse shape. */
  get<T>(url: string): Observable<HttpResponse<T>> {
    const pathSegments = this.parseUrl(url);
    const [rootCollection, ...remainingSegments] = pathSegments as [string, ...string[]];
    const docRef = doc(this.db, rootCollection, ...remainingSegments);

    return from(getDoc(docRef)).pipe(
      map(
        (snapshot) =>
          new HttpResponse<T>({
            status: snapshot.exists() ? 200 : 404,
            statusText: snapshot.exists() ? 'Success' : 'Not Found',
            body: this.unwrapSectionData(snapshot.data()) as T,
          }),
      ),
      catchError((err) => this.handleError<T>(err)),
    );
  }

  /** Creates a new document with a generated Firebase ID and returns it as a response payload. */
  post<T>(url: string, body: any): Observable<HttpResponse<T>> {
    if (!this.isAuthenticated()) return this.throwAuthError<T>();
    const pathSegments = this.parseUrl(url);
    const [rootCollection, ...remainingSegments] = pathSegments.slice(0, -1) as [
      string,
      ...string[],
    ];
    const colRef = collection(this.db, rootCollection, ...remainingSegments);

    return from(addDoc(colRef, body)).pipe(
      map(
        (docRef) =>
          new HttpResponse<T>({
            status: 201,
            statusText: 'Created successfully',
            body: { id: docRef.id, ...body } as T,
          }),
      ),
      catchError((err) => this.handleError<T>(err)),
    );
  }

  /** Replaces an entire Firestore document with the supplied payload. */
  put<T>(url: string, body: any): Observable<HttpResponse<T>> {
    if (!this.isAuthenticated()) return this.throwAuthError<T>();
    const [rootCollection, ...remainingSegments] = this.parseUrl(url) as [string, ...string[]];
    const docRef = doc(this.db, rootCollection, ...remainingSegments);

    // setDoc replaces the target document, removing any keys not explicitly present.
    return from(setDoc(docRef, body)).pipe(
      map(
        () =>
          new HttpResponse<T>({
            status: 200,
            statusText: 'Replaced successfully',
            body: body as T,
          }),
      ),
      catchError((err) => this.handleError<T>(err)),
    );
  }

  /** Updates only the fields supplied in the request payload while preserving the rest of the document. */
  patch<T>(url: string, body: any): Observable<HttpResponse<T>> {
    if (!this.isAuthenticated()) return this.throwAuthError<T>();
    const [rootCollection, ...remainingSegments] = this.parseUrl(url) as [string, ...string[]];
    const docRef = doc(this.db, rootCollection, ...remainingSegments);

    // updateDoc only mutates the provided keys, which is safer for partial content updates.
    return from(updateDoc(docRef, body)).pipe(
      map(
        () =>
          new HttpResponse<T>({
            status: 200,
            statusText: 'Updated changes successfully',
            body: body as T,
          }),
      ),
      catchError((err) => this.handleError<T>(err)),
    );
  }

  public isAuthenticated(): boolean {
    // Returns true if a secure user profile is currently active in memory
    return !!this.fd.auth.currentUser;
  }

  /**
   * Converts the Firestore document envelope back to the feature payload shape.
   * Scalar sections remain objects; array sections are stored under `items`.
   */
  private unwrapSectionData(data: Record<string, unknown> | undefined): unknown {
    if (!data) return {};
    return Array.isArray(data['items']) ? data['items'] : data;
  }

  private throwAuthError<T>(): Observable<HttpResponse<T>> {
    return of(
      new HttpResponse<T>({
        status: 401,
        statusText: 'Unauthorized access attempt blocked.',
        body: {} as T,
      }),
    );
  }

  /** Converts Firebase exceptions to the same HttpResponse contract used by the rest of the app. */
  private handleError<T>(err: any): Observable<HttpResponse<T>> {
    const statusText = err?.code
      ? `${err.code}: ${err.message}`
      : err?.message || 'Firebase internal operation failure';

    return of(
      new HttpResponse<T>({
        status: 500,
        statusText,
        body: {} as T,
      }),
    );
  }
}
```
