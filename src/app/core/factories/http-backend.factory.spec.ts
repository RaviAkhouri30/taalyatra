import { TestBed } from '@angular/core/testing';
import { provideBackend } from '@core/config/provide-backend';
import { FakeHttpsService } from '@core/backends/fake/fake-https.service';
import { FirebaseBackendService } from '@core/backends/firebase/firebase-backend.service';
import { DraftOverlayBackend } from '@core/backends/preview/draft-overlay-backend';
import { RestHttpBackend } from '@core/backends/rest/rest-http-backend.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { environment } from '@env/environment';

describe('httpBackendFactory', () => {
  it.each([
    [BackendType.Fake, FakeHttpsService],
    [BackendType.Rest, RestHttpBackend],
    [BackendType.Firebase, FirebaseBackendService],
  ])('should provide the %s adapter for IHttpBackend', (backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideBackend(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    expect(TestBed.inject(IHttpBackend)).toBeInstanceOf(adapter);
  });

  it("should read through the owner's drafts on a preview visit", () => {
    TestBed.configureTestingModule({
      providers: [
        provideBackend(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend: BackendType.Fake } },
        { provide: APP_PREVIEW, useValue: true },
      ],
    });

    expect(TestBed.inject(IHttpBackend)).toBeInstanceOf(DraftOverlayBackend);
  });
});
