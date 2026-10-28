import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FAKE_ADMIN_ACCOUNT, FAKE_VISITOR_ACCOUNT } from './fake-auth.constants';
import { FakeAuthService } from './fake-auth.service';

describe('FakeAuthService', () => {
  function create(): FakeAuthService {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_ENVIRONMENT,
          useValue: { ...environment, fakeLatencyMs: 0, adminUid: 'admin-uid' },
        },
      ],
    });
    return TestBed.runInInjectionContext(() => new FakeAuthService());
  }

  it('should start signed out', async () => {
    await expect(firstValueFrom(create().user$)).resolves.toBeNull();
  });

  it('should sign the fake admin in with the configured admin UID, then out', async () => {
    const auth = create();

    await firstValueFrom(auth.signIn(` ${FAKE_ADMIN_ACCOUNT.email} `, FAKE_ADMIN_ACCOUNT.password));
    await expect(firstValueFrom(auth.user$)).resolves.toEqual({
      uid: 'admin-uid',
      email: FAKE_ADMIN_ACCOUNT.email,
    });
    await firstValueFrom(auth.signOut());
    await expect(firstValueFrom(auth.user$)).resolves.toBeNull();
  });

  it('should sign the non-admin account in with its own UID', async () => {
    const user = await firstValueFrom(
      create().signIn(FAKE_VISITOR_ACCOUNT.email, FAKE_VISITOR_ACCOUNT.password),
    );

    expect(user.uid).toBe(FAKE_VISITOR_ACCOUNT.uid);
  });

  it('should refuse a wrong password with InvalidCredentials', async () => {
    await expect(
      firstValueFrom(create().signIn(FAKE_ADMIN_ACCOUNT.email, 'wrong')),
    ).rejects.toMatchObject({ kind: AuthErrorKind.InvalidCredentials });
  });

  it('should accept a password-reset request', async () => {
    await expect(
      firstValueFrom(create().sendPasswordReset('a@b.c', '/admin/sign-in')),
    ).resolves.toBeUndefined();
  });
});
