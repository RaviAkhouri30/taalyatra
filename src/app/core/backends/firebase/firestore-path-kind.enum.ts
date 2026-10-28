/** What a Firestore path points at, decided by its segment count. */
export enum FirestorePathKind {
  /** Even segment count, e.g. `home/hero`. */
  Document = 'document',
  /** Odd segment count, e.g. `videos`. */
  Collection = 'collection',
}
