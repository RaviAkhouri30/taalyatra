import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, delay, map, of } from 'rxjs';
import { isFirestoreFields, unwrapListSection } from '@core/backends/firebase/firestore-envelope';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FakeDataStore } from './fake-data-store.service';

/** Shape of the JSON document: nested objects addressed by "/"-separated paths. */
/**
 * Local JSON backend used until Firebase is set up (development, demos, e2e).
 *
 * Reads `fake-db.json`, whose keys mirror endpoint paths (`home/hero` → `db.home.hero`). The file
 * is loaded lazily as its own chunk on the first request, so it never weighs on the initial
 * bundle. Writes are acknowledged but not stored: the data is read-only by design.
 */
export class FakeHttpsService implements IHttpBackend {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  private readonly store = inject(FakeDataStore);

  private static toResponse<T>(body: unknown): HttpResponse<T> {
    return body === undefined
      ? new HttpResponse<T>({ status: HttpStatusCode.NotFound })
      : new HttpResponse<T>({ status: HttpStatusCode.Ok, body: body as T });
  }

  public get<T>(path: string): Observable<HttpResponse<T>> {
    return this.store.read(path).pipe(
      // A list section written back by the editor sits in its `_items` envelope, as in Firestore;
      // unwrap it the way the Firestore adapter does.
      map((body) =>
        FakeHttpsService.toResponse<T>(isFirestoreFields(body) ? unwrapListSection(body) : body),
      ),
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
