import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { LocalStoreService } from '@core/services/local-store.service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FAKE_ADMIN_ACCOUNT, FAKE_VISITOR_ACCOUNT } from './fake-auth.constants';
import { FAKE_SESSION_STORAGE_KEY, FakeAuthService } from './fake-auth.service';

describe('FakeAuthService', () => {
  /** Stands in for the browser's storage; it outlives each TestBed, like a real reload. */
  let saved: Map<string, string>;

  function create(): FakeAuthService {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_ENVIRONMENT,
          useValue: { ...environment, fakeLatencyMs: 0, adminUid: 'admin-uid' },
        },
        {
          provide: LocalStoreService,
          useValue: {
            get: (key: string) => saved.get(key) ?? null,
            set: (key: string, value: string) => saved.set(key, value),
          },
        },
      ],
    });
    return TestBed.runInInjectionContext(() => new FakeAuthService());
  }

  beforeEach(() => {
    saved = new Map();
  });

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

  it('should stay signed in after a reload, like Firebase Auth', async () => {
    await firstValueFrom(create().signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password));
    TestBed.resetTestingModule();

    await expect(firstValueFrom(create().user$)).resolves.toMatchObject({ uid: 'admin-uid' });
  });

  it('should forget the session on sign-out and ignore an unknown saved account', async () => {
    const auth = create();
    await firstValueFrom(auth.signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password));
    await firstValueFrom(auth.signOut(), { defaultValue: undefined });
    TestBed.resetTestingModule();
    expect(saved.get(FAKE_SESSION_STORAGE_KEY)).toBe('');

    saved.set(FAKE_SESSION_STORAGE_KEY, 'someone-else');

    await expect(firstValueFrom(create().user$)).resolves.toBeNull();
  });
});
