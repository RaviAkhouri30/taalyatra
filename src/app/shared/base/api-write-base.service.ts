import { inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { HttpsErrorHandler } from '@core/services/https-error-handler.service';
import { type ApiEndpoint } from '@shared/enums/api-endpoint.enum';

/**
 * Base class for feature services that write (CLAUDE.md §3). Separate from `ApiBaseService`, so a
 * write-only service is not forced to implement a view-data read (interface segregation).
 * @template B Shape of the data the concrete service sends.
 */
export abstract class ApiWriteBaseService<B> {
  private readonly backend = inject(IHttpBackend);
  private readonly errorHandler = inject(HttpsErrorHandler);

  /**
   * Creates a record under `endpoint`.
   * @param endpoint Backend collection to add to.
   * @param body The record.
   * @returns Emits once when stored, then completes.
   * @throws Rethrows the failure (after `HttpsErrorHandler` reports it), so the caller can react.
   */
  protected attachCreateApiHandler(endpoint: ApiEndpoint, body: B): Observable<void> {
    return this.errorHandler
      .handleCommand(this.backend.post<unknown>(endpoint, body))
      .pipe(map(() => undefined));
  }

  /**
   * @param body The record to store.
   * @returns Emits once when stored; errors when the backend rejects it.
   */
  public abstract create(body: B): Observable<void>;
}
