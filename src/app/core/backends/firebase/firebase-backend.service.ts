import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { type FirestoreFields, isFirestoreFields } from './firestore-envelope';
import { toHttpStatus } from './firestore-error-status';
import { FIRESTORE_PRELOADED_COLLECTIONS } from './firestore.constants';
import { FirestorePath } from './firestore-path';
import { FirestorePathKind } from './firestore-path-kind.enum';
import { FirestoreConnection } from './firestore-connection.service';
import { type IFirestoreGateway } from './i-firestore-gateway';

/** One SDK call against a validated path. */
type FirestoreCall = (gateway: IFirestoreGateway, path: string) => Observable<unknown>;

/** How a write operation runs: the path kind it needs, its success status and its SDK call. */
interface IWriteSpec {
  readonly kind: FirestorePathKind;
  readonly success: HttpStatusCode;
  readonly call: (fields: FirestoreFields) => FirestoreCall;
}

/**
 * Cloud Firestore adapter (ADR-0009). Two-segment paths (`home/hero`) are documents; one-segment
 * paths (`videos`) are collections, read in `order`. Honours the `IHttpBackend` contract: every
 * call emits one `HttpResponse` and completes, and failures become non-2xx responses, never
 * thrown errors. The SDK lives in `FirestoreGateway`, loaded on the first request
 * (`FIRESTORE_GATEWAY_LOADER`).
 */
export class FirebaseBackendService implements IHttpBackend {
  /** `null` when Firebase is not configured: every request then answers 503. */
  private readonly gateway$ = inject(FirestoreConnection).gateway$;

  private readonly preloads = new Map<string, Observable<ReadonlyMap<string, unknown>>>();

  private static respond<T>(status: HttpStatusCode, body?: unknown): HttpResponse<T> {
    return new HttpResponse<T>({ status, body: (body ?? null) as T });
  }

  public get<T>(path: string): Observable<HttpResponse<T>> {
    const target = FirestorePath.parse(path);
    return this.request<T>(
      target,
      Object.values(FirestorePathKind),
      this.readCall(target),
      HttpStatusCode.Ok,
    );
  }

  public post<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.write<T>(path, body, {
      kind: FirestorePathKind.Collection,
      success: HttpStatusCode.Created,
      call: (fields) => (gateway, at) =>
        gateway.addDocument(at, fields).pipe(map((id) => ({ id, ...fields }))),
    });
  }

  public put<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.write<T>(path, body, {
      kind: FirestorePathKind.Document,
      success: HttpStatusCode.Ok,
      call: (fields) => (gateway, at) => gateway.setDocument(at, fields).pipe(map(() => fields)),
    });
  }

  public patch<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.write<T>(path, body, {
      kind: FirestorePathKind.Document,
      success: HttpStatusCode.Ok,
      call: (fields) => (gateway, at) => gateway.updateDocument(at, fields).pipe(map(() => fields)),
    });
  }

  public delete<T>(path: string): Observable<HttpResponse<T>> {
    const call: FirestoreCall = (gateway, at) => gateway.deleteDocument(at).pipe(map(() => null));
    return this.request<T>(
      FirestorePath.parse(path),
      [FirestorePathKind.Document],
      call,
      HttpStatusCode.NoContent,
    );
  }

  /** @returns How to read `target`: a sorted list, a preloaded document, or a single document. */
  private readCall(target: FirestorePath | null): FirestoreCall {
    if (target?.kind === FirestorePathKind.Collection) {
      return (gateway, at) => gateway.listCollection(at);
    }
    if (target !== null && FIRESTORE_PRELOADED_COLLECTIONS.includes(target.parent)) {
      const { parent, id } = target;
      return (gateway) => this.preload(gateway, parent).pipe(map((documents) => documents.get(id)));
    }
    return (gateway, at) => gateway.getDocument(at);
  }

  /**
   * @returns Every document of the collection by id, read whole on first use and replayed after;
   * a failed read is not cached, so the next request retries.
   */
  private preload(
    gateway: IFirestoreGateway,
    collection: string,
  ): Observable<ReadonlyMap<string, unknown>> {
    const cached =
      this.preloads.get(collection) ??
      gateway
        .getCollectionDocuments(collection)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.preloads.set(collection, cached);
    return cached;
  }

  /** Validates a write's body (a plain object) before running it. */
  private write<T>(path: string, body: unknown, spec: IWriteSpec): Observable<HttpResponse<T>> {
    return isFirestoreFields(body)
      ? this.request<T>(FirestorePath.parse(path), [spec.kind], spec.call(body), spec.success)
      : of(FirebaseBackendService.respond<T>(HttpStatusCode.BadRequest));
  }

  /**
   * Runs `call` when the path suits the operation and Firebase is configured.
   * @returns `success` with the body; 404 when the call found nothing; 400, 503 or a status
   * translated from the Firebase error code otherwise.
   */
  private request<T>(
    target: FirestorePath | null,
    allowed: readonly FirestorePathKind[],
    call: FirestoreCall,
    success: HttpStatusCode,
  ): Observable<HttpResponse<T>> {
    if (target === null || !allowed.includes(target.kind)) {
      return of(FirebaseBackendService.respond<T>(HttpStatusCode.BadRequest));
    }
    if (this.gateway$ === null) {
      return of(FirebaseBackendService.respond<T>(HttpStatusCode.ServiceUnavailable));
    }
    return this.gateway$.pipe(
      // gateway$ emits exactly once, so no flattening strategy can drop or reorder anything.
      switchMap((gateway) => call(gateway, target.path)),
      map((body) =>
        body === undefined
          ? FirebaseBackendService.respond<T>(HttpStatusCode.NotFound)
          : FirebaseBackendService.respond<T>(success, body),
      ),
      catchError((error: unknown) => of(FirebaseBackendService.respond<T>(toHttpStatus(error)))),
    );
  }
}
