import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, defer, delay, map, of, shareReplay } from 'rxjs';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/** Shape of the JSON document: nested objects addressed by "/"-separated paths. */
type FakeDbNode = Readonly<Record<string, unknown>>;

/**
 * Local JSON backend used until Firebase is set up (development, demos, e2e).
 *
 * Reads `fake-db.json`, whose keys mirror endpoint paths (`home/hero` → `db.home.hero`). The file
 * is loaded lazily as its own chunk on the first request, so it never weighs on the initial
 * bundle. Writes are acknowledged but not stored: the data is read-only by design.
 */
export class FakeHttpsService implements IHttpBackend {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  // The dynamic import is a Promise; it is wrapped with defer() here, inside the adapter only
  // (CLAUDE.md §7), and cached so the file is fetched once.
  private readonly db$: Observable<FakeDbNode> = defer(() => import('./fake-db.json')).pipe(
    map((module) => module.default as FakeDbNode),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  /** Walks the document along the path's segments; `undefined` when any segment is missing. */
  private static resolve(db: FakeDbNode, path: string): unknown {
    const segments = path.split('/').filter((segment) => segment.length > 0);
    return segments.reduce<unknown>(
      (node, segment) =>
        typeof node === 'object' && node !== null
          ? new Map(Object.entries(node)).get(segment)
          : undefined,
      db,
    );
  }

  private static toResponse<T>(body: unknown): HttpResponse<T> {
    return body === undefined
      ? new HttpResponse<T>({ status: HttpStatusCode.NotFound })
      : new HttpResponse<T>({ status: HttpStatusCode.Ok, body: body as T });
  }

  public get<T>(path: string): Observable<HttpResponse<T>> {
    return this.db$.pipe(
      map((db) => FakeHttpsService.toResponse<T>(FakeHttpsService.resolve(db, path))),
      delay(this.latencyMs),
    );
  }

  public post<T>(_path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.acknowledge<T>(HttpStatusCode.Created, body);
  }

  public put<T>(_path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.acknowledge<T>(HttpStatusCode.Ok, body);
  }

  public patch<T>(_path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.acknowledge<T>(HttpStatusCode.Ok, body);
  }

  public delete<T>(_path: string): Observable<HttpResponse<T>> {
    return this.acknowledge<T>(HttpStatusCode.NoContent, null);
  }

  private acknowledge<T>(status: HttpStatusCode, body: unknown): Observable<HttpResponse<T>> {
    return of(new HttpResponse<T>({ status, body: body as T })).pipe(delay(this.latencyMs));
  }
}
