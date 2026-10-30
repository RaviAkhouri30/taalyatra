import { inject } from '@angular/core';
import { FakeDocumentStore } from '@core/backends/fake/fake-document-store';
import { FirebaseDocumentStore } from '@core/backends/firebase/firebase-document-store';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IDocumentStore } from '@core/interfaces/i-document-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the content editor's storage adapter (ADR-0002, ADR-0013). Runs in an injection context,
 * so the adapters may call `inject()`.
 *
 * @returns Firestore in Firebase builds; the offline store otherwise.
 */
export function documentStoreFactory(): IDocumentStore {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new FirebaseDocumentStore()
    : new FakeDocumentStore();
}
