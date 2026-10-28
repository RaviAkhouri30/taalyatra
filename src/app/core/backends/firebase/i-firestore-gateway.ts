import { type Observable } from 'rxjs';
import { type IFirebaseConfig, type IFirestoreEmulator } from '@core/interfaces/i-firebase-config';
import { type FirestoreFields } from './firestore-envelope';

/** The SDK operations `FirebaseBackendService` needs; implemented by `FirestoreGateway`. */
export interface IFirestoreGateway {
  /** @returns The document's data, or `undefined` when it does not exist. */
  getDocument(path: string): Observable<unknown>;
  /** @returns Every document in the collection by id, list sections unwrapped. */
  getCollectionDocuments(path: string): Observable<ReadonlyMap<string, unknown>>;
  /** @returns The collection's documents in `order`. */
  listCollection(path: string): Observable<readonly FirestoreFields[]>;
  /** @returns The id of the document created. */
  addDocument(path: string, fields: FirestoreFields): Observable<string>;
  setDocument(path: string, fields: FirestoreFields): Observable<void>;
  updateDocument(path: string, fields: FirestoreFields): Observable<void>;
  deleteDocument(path: string): Observable<void>;
}

/** Creates a gateway, loading the SDK chunk first. */
export type FirestoreGatewayLoader = (
  config: IFirebaseConfig,
  emulator: IFirestoreEmulator | null,
) => Observable<IFirestoreGateway>;
