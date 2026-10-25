import { type HttpResponse } from '@angular/common/http';
import { type Observable } from 'rxjs';

/**
 * Port for all data access (CLAUDE.md §3). Also the DI token: feature code injects
 * `IHttpBackend` and never knows which adapter (fake, REST, Firebase) answers.
 *
 * Every adapter honours the same contract: it emits one `HttpResponse` and completes. Failures
 * are reported as non-2xx responses, so callers handle them in one place (`HttpsErrorHandler`).
 */
export abstract class IHttpBackend {
  /** Reads the resource at `path`. */
  public abstract get<T>(path: string): Observable<HttpResponse<T>>;
  /** Creates a resource under `path` and returns it. */
  public abstract post<T>(path: string, body: unknown): Observable<HttpResponse<T>>;
  /** Replaces the resource at `path`. */
  public abstract put<T>(path: string, body: unknown): Observable<HttpResponse<T>>;
  /** Partially updates the resource at `path`. */
  public abstract patch<T>(path: string, body: unknown): Observable<HttpResponse<T>>;
  /** Deletes the resource at `path`. */
  public abstract delete<T>(path: string): Observable<HttpResponse<T>>;
}
