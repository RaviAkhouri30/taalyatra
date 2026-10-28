import { type HttpResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { EMPTY, type Observable, catchError, defer, finalize, map, tap, timeout } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { LoaderService } from './loader.service';
import { LoggerService } from './logger.service';

/** Error raised when a backend answers with a non-2xx status. */
export class BackendResponseError extends Error {
  public constructor(public readonly status: number) {
    super(`Backend responded with status ${String(status)}`);
    this.name = 'BackendResponseError';
  }
}

/**
 * Wraps every backend call (CLAUDE.md §3): tracks loading, enforces a timeout, turns non-2xx
 * responses into errors, and reports failures. A failed read completes without emitting, so a
 * view keeps its previous state; a failed command rethrows, so its caller can react.
 */
@Service()
export class HttpsErrorHandler {
  private readonly loader = inject(LoaderService);
  private readonly logger = inject(LoggerService);
  private readonly timeoutMs = inject(APP_ENVIRONMENT).requestTimeoutMs;

  /**
   * For reads that feed a view: a failure is reported and swallowed, so the view keeps its state.
   * @param request$ A cold backend request.
   * @returns The successful response, or nothing if the request failed.
   */
  public handle<T>(request$: Observable<HttpResponse<T>>): Observable<HttpResponse<T>> {
    return this.track(request$).pipe(catchError(() => EMPTY));
  }

  /**
   * For commands (writes) whose caller must know the outcome: a failure is reported, then rethrown.
   * @param request$ A cold backend request.
   * @returns The successful response.
   * @throws {BackendResponseError} When the backend answers with a non-2xx status; other errors
   * (timeout, network) are rethrown as they are.
   */
  public handleCommand<T>(request$: Observable<HttpResponse<T>>): Observable<HttpResponse<T>> {
    return this.track(request$);
  }

  /** Loader, timeout, status check and logging shared by reads and commands. */
  private track<T>(request$: Observable<HttpResponse<T>>): Observable<HttpResponse<T>> {
    // defer: start the loader only when someone subscribes (requests stay lazy).
    return defer(() => {
      this.loader.start();
      return request$.pipe(
        timeout(this.timeoutMs),
        map((response) => this.assertOk(response)),
        tap({
          error: (error: unknown) => {
            this.logger.error('Backend request failed', error);
          },
        }),
        finalize(() => {
          this.loader.stop();
        }),
      );
    });
  }

  private assertOk<T>(response: HttpResponse<T>): HttpResponse<T> {
    if (!response.ok) {
      throw new BackendResponseError(response.status);
    }
    return response;
  }
}
