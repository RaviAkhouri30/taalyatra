import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FAKE_MANAGER_ACCOUNT } from './fake-auth.constants';
import { FakeAccountService } from './fake-account.service';

describe('FakeAccountService', () => {
  function create(): FakeAccountService {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } }],
    });
    return TestBed.runInInjectionContext(() => new FakeAccountService());
  }

  it('should give a new email an id made from it', async () => {
    expect(await firstValueFrom(create().create(' New.Person@Example.com '))).toBe(
      'fake-new-person-example-com',
    );
  });

  it('should refuse an email the Fake already has', async () => {
    await expect(firstValueFrom(create().create(FAKE_MANAGER_ACCOUNT.email))).rejects.toMatchObject(
      {
        kind: AccountErrorKind.EmailTaken,
      },
    );
  });
});
