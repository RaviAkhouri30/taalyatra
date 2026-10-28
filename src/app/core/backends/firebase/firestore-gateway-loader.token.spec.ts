import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FirestoreGateway } from './firestore-gateway';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';

// The SDK must not run in unit tests; same shared mock as the gateway spec.
vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/firestore/lite',
  async () => (await import('./testing/firebase-sdk.mock')).firestoreLiteMock,
);

describe('FIRESTORE_GATEWAY_LOADER', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'taal-yatra.firebaseapp.com',
    projectId: 'taal-yatra',
    storageBucket: 'taal-yatra.firebasestorage.app',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
  };

  it('should load the gateway chunk and create a gateway when subscribed', async () => {
    const load = TestBed.inject(FIRESTORE_GATEWAY_LOADER);

    await expect(firstValueFrom(load(config, null))).resolves.toBeInstanceOf(FirestoreGateway);
  });
});
