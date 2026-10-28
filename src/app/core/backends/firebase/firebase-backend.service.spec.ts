import { HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { defer, firstValueFrom, of, throwError } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';
import { FirebaseBackendService } from './firebase-backend.service';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';

describe('FirebaseBackendService', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'taal-yatra.firebaseapp.com',
    projectId: 'taal-yatra',
    storageBucket: 'taal-yatra.firebasestorage.app',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
  };
  const emulator = { host: '127.0.0.1', port: 8080 };
  // Stands in for the lazily loaded SDK chunk; the gateway has its own spec.
  const gateway = {
    getDocument: vi.fn(),
    listCollection: vi.fn(),
    addDocument: vi.fn(),
    setDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  };
  const created = vi.fn();

  function create(firebase: typeof config | null = config): FirebaseBackendService {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, firestoreEmulator: emulator } },
        { provide: FIREBASE_CONFIG, useValue: firebase },
        {
          provide: FIRESTORE_GATEWAY_LOADER,
          useValue: (...args: unknown[]) =>
            defer(() => {
              created(...args);
              return of(gateway);
            }),
        },
      ],
    });
    return TestBed.runInInjectionContext(() => new FirebaseBackendService());
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should load the SDK only on subscribe, once, with the config and emulator', async () => {
      gateway.getDocument.mockReturnValue(of({ title: 'Hero' }));
      const service = create();
      const first = service.get('home/hero');

      expect(created).not.toHaveBeenCalled();
      await firstValueFrom(first);
      await firstValueFrom(service.get('home/offer'));
      expect(created).toHaveBeenCalledTimes(1);
      expect(created).toHaveBeenCalledWith(config, emulator);
    });

    it('should answer 200 with the body when the document exists', async () => {
      gateway.getDocument.mockReturnValue(of({ title: 'Hero' }));

      await expect(firstValueFrom(create().get('home/hero'))).resolves.toMatchObject({
        status: HttpStatusCode.Ok,
        body: { title: 'Hero' },
      });
      expect(gateway.getDocument).toHaveBeenCalledWith('home/hero');
    });

    it('should answer 404 when the document is missing', async () => {
      gateway.getDocument.mockReturnValue(of(undefined));

      await expect(firstValueFrom(create().get('home/missing'))).resolves.toMatchObject({
        status: HttpStatusCode.NotFound,
        body: null,
      });
    });

    it('should list the collection when the path has one segment', async () => {
      gateway.listCollection.mockReturnValue(of([]));

      await expect(firstValueFrom(create().get('videos'))).resolves.toMatchObject({
        status: HttpStatusCode.Ok,
        body: [],
      });
      expect(gateway.listCollection).toHaveBeenCalledWith('videos');
    });

    it('should answer 400 without loading the SDK when the path is invalid', async () => {
      await expect(firstValueFrom(create().get('home/..'))).resolves.toMatchObject({
        status: HttpStatusCode.BadRequest,
      });
      expect(created).not.toHaveBeenCalled();
    });

    it('should answer 503 without loading the SDK when Firebase is not configured', async () => {
      await expect(firstValueFrom(create(null).get('home/hero'))).resolves.toMatchObject({
        status: HttpStatusCode.ServiceUnavailable,
      });
      expect(created).not.toHaveBeenCalled();
    });

    it('should translate a Firebase error into a status instead of throwing', async () => {
      gateway.getDocument.mockReturnValue(throwError(() => ({ code: 'permission-denied' })));

      await expect(firstValueFrom(create().get('home/hero'))).resolves.toMatchObject({
        status: HttpStatusCode.Forbidden,
      });
    });
  });

  describe('writes', () => {
    it('should answer 201 with the new id when posting to a collection', async () => {
      gateway.addDocument.mockReturnValue(of('abc'));

      await expect(
        firstValueFrom(create().post('proposals', { name: 'Asha' })),
      ).resolves.toMatchObject({
        status: HttpStatusCode.Created,
        body: { id: 'abc', name: 'Asha' },
      });
      expect(gateway.addDocument).toHaveBeenCalledWith('proposals', { name: 'Asha' });
    });

    it('should answer 200 with the body when replacing or updating a document', async () => {
      gateway.setDocument.mockReturnValue(of(undefined));
      gateway.updateDocument.mockReturnValue(of(undefined));
      const service = create();

      await expect(firstValueFrom(service.put('home/hero', { a: 1 }))).resolves.toMatchObject({
        status: HttpStatusCode.Ok,
        body: { a: 1 },
      });
      await expect(firstValueFrom(service.patch('home/hero', { b: 2 }))).resolves.toMatchObject({
        status: HttpStatusCode.Ok,
        body: { b: 2 },
      });
    });

    it('should answer 204 without a body when deleting a document', async () => {
      gateway.deleteDocument.mockReturnValue(of(undefined));

      await expect(firstValueFrom(create().delete('home/hero'))).resolves.toMatchObject({
        status: HttpStatusCode.NoContent,
        body: null,
      });
    });

    it.each([
      ['posting to a document', (s: FirebaseBackendService) => s.post('home/hero', {})],
      ['replacing a collection', (s: FirebaseBackendService) => s.put('videos', {})],
      ['updating a collection', (s: FirebaseBackendService) => s.patch('videos', {})],
      ['deleting a collection', (s: FirebaseBackendService) => s.delete('videos')],
      ['posting a list body', (s: FirebaseBackendService) => s.post('proposals', [])],
      ['posting no body', (s: FirebaseBackendService) => s.post('proposals', null)],
    ])('should answer 400 when %s', async (_case, call) => {
      await expect(firstValueFrom(call(create()))).resolves.toMatchObject({
        status: HttpStatusCode.BadRequest,
      });
      expect(created).not.toHaveBeenCalled();
    });
  });
});
