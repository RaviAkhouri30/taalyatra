import { provideHttpClient } from '@angular/common/http';
import { type EnvironmentProviders, type Provider } from '@angular/core';
import { clipboardServiceFactory } from '@core/factories/clipboard-service.factory';
import { emailServiceFactory } from '@core/factories/email-service.factory';
import { httpBackendFactory } from '@core/factories/http-backend.factory';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IEmailService } from '@core/interfaces/i-email-service';
import { IHttpBackend } from '@core/interfaces/i-http-backend';

/** Registers the adapters: `HttpClient`, and the `IHttpBackend`, `IEmailService` and `IClipboardService` ports. */
export function provideBackend(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    { provide: IHttpBackend, useFactory: httpBackendFactory },
    { provide: IEmailService, useFactory: emailServiceFactory },
    { provide: IClipboardService, useFactory: clipboardServiceFactory },
  ];
}
