import { TestBed } from '@angular/core/testing';
import { provideBackend } from '@core/config/provide-backend';
import { FakeHttpsService } from '@core/backends/fake/fake-https.service';
import { RestHttpBackend } from '@core/backends/rest/rest-http-backend.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';

describe('httpBackendFactory', () => {
  it.each([
    [BackendType.Fake, FakeHttpsService],
    [BackendType.Rest, RestHttpBackend],
  ])('should provide the %s adapter for IHttpBackend', (backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideBackend(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    expect(TestBed.inject(IHttpBackend)).toBeInstanceOf(adapter);
  });
});
