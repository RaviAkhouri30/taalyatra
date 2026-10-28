import {
  connectAuthEmulator,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { AuthGateway } from './auth-gateway';

// The gateway is the one file that calls the Auth SDK, so its spec mocks the SDK modules
// through the shared mock (the coverage run shares modules between spec files).
vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/auth',
  async () => (await import('./testing/firebase-sdk.mock')).firebaseAuthMock,
);

describe('AuthGateway', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };
  const firebaseUser = { uid: 'admin', email: 'owner@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to the emulator when one is given', () => {
    expect(new AuthGateway(config, { host: '127.0.0.1', port: 9099 })).toBeInstanceOf(AuthGateway);
    expect(connectAuthEmulator).toHaveBeenCalledWith({ type: 'auth' }, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
  });

  it('should emit the signed-in user, and null when signed out', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, next) => {
      (next as (user: unknown) => void)(firebaseUser);
      return () => undefined;
    });
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, next) => {
      (next as (user: unknown) => void)(null);
      return () => undefined;
    });
    const gateway = new AuthGateway(config, null);

    await expect(firstValueFrom(gateway.user$)).resolves.toEqual(firebaseUser);
    await expect(firstValueFrom(gateway.user$)).resolves.toBeNull();
  });

  it('should fail user$ when the listener reports an error', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, _next, error) => {
      (error as (reason: unknown) => void)(new Error('broken'));
      return () => undefined;
    });

    await expect(firstValueFrom(new AuthGateway(config, null).user$)).rejects.toThrow('broken');
  });

  it('should sign in lazily and return the user', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: { ...firebaseUser, email: null },
    } as never);
    const signIn = new AuthGateway(config, null).signIn('owner@example.com', 'pw');

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    await expect(firstValueFrom(signIn)).resolves.toEqual({ uid: 'admin', email: '' });
  });

  it('should sign out and send a reset email with the continue link', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);
    const gateway = new AuthGateway(config, null);

    await firstValueFrom(gateway.signOut());
    await firstValueFrom(gateway.sendPasswordReset('owner@example.com', 'https://x/admin/sign-in'));

    expect(signOut).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({ type: 'auth' }, 'owner@example.com', {
      url: 'https://x/admin/sign-in',
    });
  });
});
