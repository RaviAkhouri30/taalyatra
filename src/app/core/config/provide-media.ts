import { provideHttpClient, withXhr } from '@angular/common/http';
import { type EnvironmentProviders, type Provider } from '@angular/core';
import { mediaServiceFactory } from '@core/factories/media-service.factory';
import { IMediaService } from '@core/interfaces/i-media-service';

/**
 * @returns The `IMediaService` port's providers, for the admin routes only (D9). They bring their own
 *   `HttpClient` on XHR, because Angular's default `fetch` transport can't report upload progress and
 *   refuses any request that asks. Public pages keep the default.
 */
export function provideMedia(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withXhr()),
    { provide: IMediaService, useFactory: mediaServiceFactory },
  ];
}
