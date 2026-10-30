import { provideHttpClient } from '@angular/common/http';
import { type EnvironmentProviders, type Provider } from '@angular/core';
import { authServiceFactory } from '@core/factories/auth-service.factory';
import { clipboardServiceFactory } from '@core/factories/clipboard-service.factory';
import { documentStoreFactory } from '@core/factories/document-store.factory';
import { emailServiceFactory } from '@core/factories/email-service.factory';
import { httpBackendFactory } from '@core/factories/http-backend.factory';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IEmailService } from '@core/interfaces/i-email-service';
import { IHttpBackend } from '@core/interfaces/i-http-backend';

/** Registers the adapters: `HttpClient`, and the `IHttpBackend`, `IEmailService`, `IClipboardService` and `IAuthService`
 * ports. */
export function provideBackend(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    { provide: IHttpBackend, useFactory: httpBackendFactory },
    { provide: IEmailService, useFactory: emailServiceFactory },
    { provide: IClipboardService, useFactory: clipboardServiceFactory },
    { provide: IAuthService, useFactory: authServiceFactory },
    { provide: IDocumentStore, useFactory: documentStoreFactory },
  ];
}
