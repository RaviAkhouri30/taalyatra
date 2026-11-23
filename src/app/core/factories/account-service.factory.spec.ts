import { TestBed } from '@angular/core/testing';
import { FakeAccountService } from '@core/backends/fake/fake-account.service';
import { FirebaseAccountService } from '@core/backends/firebase/firebase-account.service';
import { provideAccounts } from '@core/config/provide-accounts';
import { provideMedia } from '@core/config/provide-media';
import { BackendType } from '@core/enums/backend-type.enum';
import { IAccountService } from '@core/interfaces/i-account-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';

describe('accountServiceFactory', () => {
  it.each([
    ['Firebase’s sign-up for Firebase', BackendType.Firebase, FirebaseAccountService],
    ['the fake for the fake backend', BackendType.Fake, FakeAccountService],
  ])('should provide %s', (_case, backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideMedia(),
        provideAccounts(),
        { provide: FIREBASE_CONFIG, useValue: { apiKey: 'k' } },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    expect(TestBed.inject(IAccountService)).toBeInstanceOf(adapter);
  });
});
