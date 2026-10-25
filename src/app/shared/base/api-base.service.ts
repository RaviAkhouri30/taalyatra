import { inject } from '@angular/core';
import { type Observable, filter, map } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { HttpsErrorHandler } from '@core/services/https-error-handler.service';
import { type ApiEndpoint } from '@shared/enums/api-endpoint.enum';

/**
 * Base class for feature services (CLAUDE.md §3). Sends reads through the `IHttpBackend` port and
 * `HttpsErrorHandler`, and hands back just the response body.
 * @template T Shape of the data the concrete service provides.
 */
export abstract class ApiBaseService<T> {
  private readonly backend = inject(IHttpBackend);
  private readonly errorHandler = inject(HttpsErrorHandler);

  /**
   * Reads one endpoint.
   * @param endpoint Backend path to read.
   * @returns The response body; emits nothing if the request failed or had no body.
   */
  protected attachViewApiHandler(endpoint: ApiEndpoint): Observable<T> {
    return this.errorHandler.handle(this.backend.get<T>(endpoint)).pipe(
      map((response) => response.body),
      filter((body): body is T => body !== null),
    );
  }

  /** @returns The data for the service's view. */
  public abstract attachViewDataHandler(): Observable<T>;
}
