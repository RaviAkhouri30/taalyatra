import { type HttpResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { EMPTY, type Observable, catchError, defer, finalize, map, timeout } from 'rxjs';
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
 * responses into errors, and reports failures. A failed request completes without emitting, so a
 * view keeps its previous state instead of breaking.
 */
@Service()
export class HttpsErrorHandler {
  private readonly loader = inject(LoaderService);
  private readonly logger = inject(LoggerService);
  private readonly timeoutMs = inject(APP_ENVIRONMENT).requestTimeoutMs;

  /**
   * @param request$ A cold backend request.
   * @returns The successful response, or nothing if the request failed.
   */
  public handle<T>(request$: Observable<HttpResponse<T>>): Observable<HttpResponse<T>> {
    // defer: start the loader only when someone subscribes (requests stay lazy).
    return defer(() => {
      this.loader.start();
      return request$.pipe(
        timeout(this.timeoutMs),
        map((response) => this.assertOk(response)),
        catchError((error: unknown) => {
          this.logger.error('Backend request failed', error);
          return EMPTY;
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
