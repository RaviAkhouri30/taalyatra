import { provideHttpClient } from '@angular/common/http';
import { type EnvironmentProviders, type Provider } from '@angular/core';
import { emailServiceFactory } from '@core/factories/email-service.factory';
import { httpBackendFactory } from '@core/factories/http-backend.factory';
import { IEmailService } from '@core/interfaces/i-email-service';
import { IHttpBackend } from '@core/interfaces/i-http-backend';

/** Registers the data layer: `HttpClient` and the `IHttpBackend` and `IEmailService` ports. */
export function provideBackend(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    { provide: IHttpBackend, useFactory: httpBackendFactory },
    { provide: IEmailService, useFactory: emailServiceFactory },
  ];
}
