import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { defer, firstValueFrom, of, throwError } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';
import { AUTH_GATEWAY_LOADER } from './auth-gateway-loader.token';
import { FirebaseAuthService } from './firebase-auth.service';

describe('FirebaseAuthService', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'taal-yatra.firebaseapp.com',
    projectId: 'taal-yatra',
    storageBucket: 'taal-yatra.firebasestorage.app',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
  };
  const user = { uid: 'admin', email: 'owner@example.com' };
  // Stands in for the lazily loaded SDK chunk; the gateway is covered by the e2e smoke suite.
  const gateway = {
    user$: of(user),
    signIn: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
  };
  const loaded = vi.fn();

  function create(firebase: typeof config | null = config): FirebaseAuthService {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, authEmulator: null } },
        { provide: FIREBASE_CONFIG, useValue: firebase },
        { provide: DOCUMENT, useValue: { location: { origin: 'https://taalyatra.in' } } },
        {
          provide: AUTH_GATEWAY_LOADER,
          useValue: () =>
            defer(() => {
              loaded();
              return of(gateway);
            }),
        },
      ],
    });
    return TestBed.runInInjectionContext(() => new FirebaseAuthService());
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load the SDK only when used, once', async () => {
    const service = create();

    expect(loaded).not.toHaveBeenCalled();
    await expect(firstValueFrom(service.user$)).resolves.toEqual(user);
    gateway.signOut.mockReturnValue(of(undefined));
    await firstValueFrom(service.signOut());
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('should sign in through the gateway', async () => {
    gateway.signIn.mockReturnValue(of(user));

    await expect(firstValueFrom(create().signIn('owner@example.com', 'pw'))).resolves.toEqual(user);
    expect(gateway.signIn).toHaveBeenCalledWith('owner@example.com', 'pw');
  });

  it('should turn a Firebase failure into an AuthError', async () => {
    gateway.signIn.mockReturnValue(throwError(() => ({ code: 'auth/wrong-password' })));

    await expect(firstValueFrom(create().signIn('a@b.c', 'x'))).rejects.toMatchObject({
      kind: AuthErrorKind.InvalidCredentials,
    });
  });

  it('should send the reset email with an absolute link back to the app', async () => {
    gateway.sendPasswordReset.mockReturnValue(of(undefined));

    await firstValueFrom(create().sendPasswordReset('owner@example.com', '/admin/sign-in'));

    expect(gateway.sendPasswordReset).toHaveBeenCalledWith(
      'owner@example.com',
      'https://taalyatra.in/admin/sign-in',
    );
  });

  it('should report no user and refuse requests when Firebase is not configured', async () => {
    const service = create(null);

    await expect(firstValueFrom(service.user$)).resolves.toBeNull();
    await expect(firstValueFrom(service.signIn('a@b.c', 'x'))).rejects.toEqual(
      new AuthError(AuthErrorKind.Unavailable),
    );
    expect(loaded).not.toHaveBeenCalled();
  });
});
