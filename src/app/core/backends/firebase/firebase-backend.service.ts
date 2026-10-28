import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import { type IFirebaseConfig, type IFirestoreEmulator } from '@core/interfaces/i-firebase-config';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { type FirestoreFields, isFirestoreFields } from './firestore-envelope';
import { toHttpStatus } from './firestore-error-status';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';
import { FIRESTORE_PRELOADED_COLLECTIONS } from './firestore.constants';
import { FirestorePath } from './firestore-path';
import { FirestorePathKind } from './firestore-path-kind.enum';
import { type FirestoreGatewayLoader, type IFirestoreGateway } from './i-firestore-gateway';

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
  private readonly gateway$ = FirebaseBackendService.loadGateway(
    inject(FIRESTORE_GATEWAY_LOADER),
    inject(FIREBASE_CONFIG),
    inject(APP_ENVIRONMENT).firestoreEmulator,
  );

  /** Documents of the preloaded collections by path, read together once; `null` like gateway$. */
  private readonly preloaded$ =
    this.gateway$ === null ? null : FirebaseBackendService.preload(this.gateway$);

  private static loadGateway(
    load: FirestoreGatewayLoader,
    config: IFirebaseConfig | null,
    emulator: IFirestoreEmulator | null,
  ): Observable<IFirestoreGateway> | null {
    // shareReplay: the chunk loads and the SDK initialises once, however many sections ask at
    // once; a failed load is not cached, so the next request retries.
    return config === null
      ? null
      : load(config, emulator).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }

  private static preload(
    gateway$: Observable<IFirestoreGateway>,
  ): Observable<ReadonlyMap<string, unknown>> {
    return gateway$.pipe(
      // gateway$ emits once. forkJoin waits for every collection: nothing renders until all have
      // arrived, which is the point (one layout pass instead of many).
      switchMap((gateway) =>
        forkJoin(
          FIRESTORE_PRELOADED_COLLECTIONS.map((name) =>
            gateway
              .getCollectionDocuments(name)
              .pipe(
                map((documents) =>
                  [...documents].map(([id, data]) => [`${name}/${id}`, data] as const),
                ),
              ),
          ),
        ),
      ),
      map((groups) => new Map(groups.flat())),
      // Read once per visit; a failed read is not cached, so the next request retries.
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

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
    const preloaded$ = this.preloaded$;
    if (
      target !== null &&
      preloaded$ !== null &&
      FIRESTORE_PRELOADED_COLLECTIONS.includes(target.parent)
    ) {
      return (_gateway, at) => preloaded$.pipe(map((documents) => documents.get(at)));
    }
    return (gateway, at) => gateway.getDocument(at);
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
