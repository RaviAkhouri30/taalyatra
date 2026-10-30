import { TestBed } from '@angular/core/testing';
import { FakeDocumentStore } from '@core/backends/fake/fake-document-store';
import { FirebaseDocumentStore } from '@core/backends/firebase/firebase-document-store';
import { BackendType } from '@core/enums/backend-type.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';
import { documentStoreFactory } from './document-store.factory';

describe('documentStoreFactory', () => {
  function create(backend: BackendType): unknown {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
        { provide: FIREBASE_CONFIG, useValue: null },
      ],
    });
    return TestBed.runInInjectionContext(documentStoreFactory);
  }

  it('should pick Firestore when the build uses Firebase', () => {
    expect(create(BackendType.Firebase)).toBeInstanceOf(FirebaseDocumentStore);
  });

  it.each([BackendType.Fake, BackendType.Rest])(
    'should pick the offline store when the build uses %s',
    (backend) => {
      expect(create(backend)).toBeInstanceOf(FakeDocumentStore);
    },
  );
});
