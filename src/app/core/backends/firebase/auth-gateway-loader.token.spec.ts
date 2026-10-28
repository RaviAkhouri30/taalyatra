import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthGateway } from './auth-gateway';
import { AUTH_GATEWAY_LOADER } from './auth-gateway-loader.token';

// The SDK must not run in unit tests; the same shared mock module as the Firestore gateway.
vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/auth',
  async () => (await import('./testing/firebase-sdk.mock')).firebaseAuthMock,
);

describe('AUTH_GATEWAY_LOADER', () => {
  it('should load the auth chunk and create a gateway when subscribed', async () => {
    const load = TestBed.inject(AUTH_GATEWAY_LOADER);
    const config = {
      apiKey: 'key',
      authDomain: 'd',
      projectId: 'p',
      storageBucket: 'b',
      messagingSenderId: 'm',
      appId: 'a',
    };

    await expect(firstValueFrom(load(config, null))).resolves.toBeInstanceOf(AuthGateway);
  });
});
