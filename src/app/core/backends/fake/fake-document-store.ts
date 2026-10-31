import { inject } from '@angular/core';
import { type Observable, defer, delay, map, of } from 'rxjs';
import { toStoredDocuments, toStoredFields } from '@core/backends/firebase/firestore-envelope';
import {
  type DocumentFields,
  type DocumentWrite,
  type IDocumentStore,
} from '@core/interfaces/i-document-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FakeDataStore } from './fake-data-store.service';

/**
 * Offline adapter for the content editor (development and e2e). It stores into the same
 * `FakeDataStore` the Fake backend reads, and mirrors Firestore's list envelope, so a document
 * read and written back keeps its stored shape.
 */
export class FakeDocumentStore implements IDocumentStore {
  private readonly store = inject(FakeDataStore);
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  public read(path: string): Observable<DocumentFields | null> {
    return this.store.read(path).pipe(map(toStoredFields), delay(this.latencyMs));
  }

  public readAll(collection: string): Observable<ReadonlyMap<string, DocumentFields>> {
    return this.store.children(collection).pipe(map(toStoredDocuments), delay(this.latencyMs));
  }

  public commit(writes: readonly DocumentWrite[]): Observable<void> {
    // defer: nothing is written until someone subscribes, like the Firestore batch.
    return defer(() => {
      this.store.apply(writes);
      return of(undefined);
    }).pipe(delay(this.latencyMs));
  }
}
