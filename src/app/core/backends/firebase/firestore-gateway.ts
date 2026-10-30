import { initializeApp } from 'firebase/app';
import {
  type Firestore,
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore/lite';
import { type Observable, defer, map } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentWrite } from '@core/interfaces/i-document-store';
import { type IFirebaseConfig, type IFirestoreEmulator } from '@core/interfaces/i-firebase-config';
import { type FirestoreFields, unwrapListSection, withoutOrder } from './firestore-envelope';
import { FIRESTORE_CREATED_AT_FIELD, FIRESTORE_ORDER_FIELD } from './firestore.constants';
import { type IFirestoreGateway } from './i-firestore-gateway';

/**
 * The only file that imports `firebase/*`. `FIRESTORE_GATEWAY_LOADER` loads it with a dynamic
 * `import()` on the first request, so the SDK is its own lazy chunk (ADR-0009). Uses Firestore
 * Lite: REST, no realtime listeners or offline cache, which a content site does not need.
 *
 * Every SDK Promise is wrapped with `defer` so calls stay lazy and cold (CLAUDE.md §7).
 */
export class FirestoreGateway implements IFirestoreGateway {
  private readonly db: Firestore;

  /**
   * @param config Firebase web settings.
   * @param emulator Local emulator to use instead of the real service, or `null`.
   */
  public constructor(config: IFirebaseConfig, emulator: IFirestoreEmulator | null) {
    // initializeApp returns the existing default app when called again with the same options.
    this.db = getFirestore(initializeApp({ ...config }));
    if (emulator !== null) {
      connectFirestoreEmulator(this.db, emulator.host, emulator.port);
    }
  }

  /** @returns The document's data (a list section unwrapped), or `undefined` when missing. */
  public getDocument(path: string): Observable<unknown> {
    return defer(() => getDoc(doc(this.db, path))).pipe(
      map((snapshot) => (snapshot.exists() ? unwrapListSection(snapshot.data()) : undefined)),
    );
  }

  /** @returns Every document in the collection by id, list sections unwrapped (one query). */
  public getCollectionDocuments(path: string): Observable<ReadonlyMap<string, unknown>> {
    return defer(() => getDocs(collection(this.db, path))).pipe(
      map(
        (snapshot) =>
          new Map(snapshot.docs.map((item) => [item.id, unwrapListSection(item.data())] as const)),
      ),
    );
  }

  /** @returns The collection's documents sorted by `order`, without that field. */
  public listCollection(path: string): Observable<readonly FirestoreFields[]> {
    return defer(() =>
      getDocs(query(collection(this.db, path), orderBy(FIRESTORE_ORDER_FIELD))),
    ).pipe(map((snapshot) => snapshot.docs.map((item) => withoutOrder(item.data()))));
  }

  /**
   * Adds a document with a generated id, stamped with the server's time.
   * @returns The new document's id.
   */
  public addDocument(path: string, fields: FirestoreFields): Observable<string> {
    return defer(() =>
      addDoc(collection(this.db, path), {
        ...fields,
        [FIRESTORE_CREATED_AT_FIELD]: serverTimestamp(),
      }),
    ).pipe(map((reference) => reference.id));
  }

  /** Replaces the document. */
  public setDocument(path: string, fields: FirestoreFields): Observable<void> {
    return defer(() => setDoc(doc(this.db, path), fields));
  }

  /** Updates only the given fields; fails when the document does not exist. */
  public updateDocument(path: string, fields: FirestoreFields): Observable<void> {
    return defer(() => updateDoc(doc(this.db, path), fields));
  }

  /** Deletes the document (succeeds even when it does not exist). */
  public deleteDocument(path: string): Observable<void> {
    return defer(() => deleteDoc(doc(this.db, path)));
  }

  public commit(writes: readonly DocumentWrite[]): Observable<void> {
    // defer: the batch is built and committed only on subscribe, so the call stays lazy and cold.
    return defer(() => {
      const batch = writeBatch(this.db);
      for (const write of writes) {
        const reference = doc(this.db, write.path);
        if (write.kind === DocumentWriteKind.Delete) {
          batch.delete(reference);
        } else {
          batch.set(reference, write.fields);
        }
      }
      return batch.commit();
    });
  }
}
