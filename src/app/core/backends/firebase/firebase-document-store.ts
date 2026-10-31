import { inject } from '@angular/core';
import { type Observable, map, switchMap, throwError } from 'rxjs';
import {
  type DocumentFields,
  type DocumentWrite,
  type IDocumentStore,
} from '@core/interfaces/i-document-store';
import { toStoredDocuments, toStoredFields } from './firestore-envelope';
import { FirestoreConnection } from './firestore-connection.service';
import { type IFirestoreGateway } from './i-firestore-gateway';

/** Raised when the editor is used without a Firebase config (never in production builds). */
export class FirestoreUnavailableError extends Error {
  public constructor() {
    super('Firebase is not configured');
    this.name = 'FirestoreUnavailableError';
  }
}

/**
 * Cloud Firestore adapter for the content editor (ADR-0013). Reads skip the public site's
 * per-visit preload, so the editor always sees what is stored; `commit` is one atomic batch.
 * Failures are errors (with nothing stored), for the editor to report.
 */
export class FirebaseDocumentStore implements IDocumentStore {
  private readonly gateway$ = inject(FirestoreConnection).gateway$;

  public read(path: string): Observable<DocumentFields | null> {
    return this.withGateway((gateway) => gateway.getDocument(path)).pipe(map(toStoredFields));
  }

  public readAll(collection: string): Observable<ReadonlyMap<string, DocumentFields>> {
    return this.withGateway((gateway) => gateway.getCollectionDocuments(collection)).pipe(
      map(toStoredDocuments),
    );
  }

  public commit(writes: readonly DocumentWrite[]): Observable<void> {
    return this.withGateway((gateway) => gateway.commit(writes));
  }

  private withGateway<T>(call: (gateway: IFirestoreGateway) => Observable<T>): Observable<T> {
    if (this.gateway$ === null) {
      return throwError(() => new FirestoreUnavailableError());
    }
    // switchMap: the gateway emits once (shared), so this only sequences "loaded, then call".
    return this.gateway$.pipe(switchMap(call));
  }
}
