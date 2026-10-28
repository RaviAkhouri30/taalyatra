import { initializeApp } from 'firebase/app';
import {
  addDoc,
  connectFirestoreEmulator,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import { firstValueFrom } from 'rxjs';
import { FirestoreGateway } from './firestore-gateway';

// The gateway is the one file that calls the SDK, so its spec mocks the SDK modules (precedent:
// the EmailJS adapter spec). Everything else mocks the gateway or the IHttpBackend port.
vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/firestore/lite',
  async () => (await import('./testing/firebase-sdk.mock')).firestoreLiteMock,
);

describe('FirestoreGateway', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'taal-yatra.firebaseapp.com',
    projectId: 'taal-yatra',
    storageBucket: 'taal-yatra.firebasestorage.app',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
  };
  const emulator = { host: '127.0.0.1', port: 8080 };

  function snapshot(data: object | undefined): unknown {
    return { exists: () => data !== undefined, data: () => data };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialise the app with the config when created', () => {
    expect(new FirestoreGateway(config, null)).toBeInstanceOf(FirestoreGateway);

    expect(initializeApp).toHaveBeenCalledWith(config);
    expect(connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('should connect to the emulator when one is given', () => {
    expect(new FirestoreGateway(config, emulator)).toBeInstanceOf(FirestoreGateway);

    expect(connectFirestoreEmulator).toHaveBeenCalledWith({ type: 'firestore' }, '127.0.0.1', 8080);
  });

  it('should read a document lazily, unwrapping a stored list section', async () => {
    vi.mocked(getDoc).mockResolvedValue(snapshot({ _items: ['Drum Circle'] }) as never);
    const read = new FirestoreGateway(config, null).getDocument('home/marquee');

    expect(getDoc).not.toHaveBeenCalled();
    await expect(firstValueFrom(read)).resolves.toEqual(['Drum Circle']);
    expect(getDoc).toHaveBeenCalledWith({ path: 'home/marquee' });
  });

  it('should answer undefined when the document does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValue(snapshot(undefined) as never);

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).getDocument('home/missing')),
    ).resolves.toBeUndefined();
  });

  it('should list a collection in order, without the order field', async () => {
    const docs = [{ data: () => ({ order: 0, title: 'First' }) }];
    vi.mocked(getDocs).mockResolvedValue({ docs } as never);

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).listCollection('videos')),
    ).resolves.toEqual([{ title: 'First' }]);
    expect(orderBy).toHaveBeenCalledWith('order');
  });

  it('should stamp the server time when adding a document', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'abc' } as never);

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).addDocument('proposals', { name: 'Asha' })),
    ).resolves.toBe('abc');
    expect(addDoc).toHaveBeenCalledWith(
      { path: 'proposals' },
      { name: 'Asha', createdAt: 'SERVER_TIMESTAMP' },
    );
  });

  it('should replace, update and delete documents by path', async () => {
    vi.mocked(setDoc).mockResolvedValue(undefined);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);
    const gateway = new FirestoreGateway(config, null);

    await firstValueFrom(gateway.setDocument('home/hero', { title: 'A' }));
    await firstValueFrom(gateway.updateDocument('home/hero', { title: 'B' }));
    await firstValueFrom(gateway.deleteDocument('home/hero'));

    expect(setDoc).toHaveBeenCalledWith({ path: 'home/hero' }, { title: 'A' });
    expect(updateDoc).toHaveBeenCalledWith({ path: 'home/hero' }, { title: 'B' });
    expect(deleteDoc).toHaveBeenCalledWith({ path: 'home/hero' });
  });
});
