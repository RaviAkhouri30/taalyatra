import { TestBed } from '@angular/core/testing';
import { provideBackend } from '@core/config/provide-backend';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { FirebaseAuthService } from '@core/backends/firebase/firebase-auth.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';

describe('authServiceFactory', () => {
  it.each([
    [BackendType.Firebase, FirebaseAuthService],
    [BackendType.Fake, FakeAuthService],
    [BackendType.Rest, FakeAuthService],
  ])('should provide the right adapter for the %s backend', (backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideBackend(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    expect(TestBed.inject(IAuthService)).toBeInstanceOf(adapter);
  });
});
