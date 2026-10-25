import { provideHttpClient } from '@angular/common/http';
import { type EnvironmentProviders, type Provider } from '@angular/core';
import { httpBackendFactory } from '@core/factories/http-backend.factory';
import { IHttpBackend } from '@core/interfaces/i-http-backend';

/** Registers the data layer: `HttpClient` (fetch is the default backend) and the `IHttpBackend` port. */
export function provideBackend(): (Provider | EnvironmentProviders)[] {
  return [provideHttpClient(), { provide: IHttpBackend, useFactory: httpBackendFactory }];
}
