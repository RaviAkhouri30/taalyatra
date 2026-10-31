/** What one write in an atomic commit does to its document. */
export enum DocumentWriteKind {
  /** Create the document, or replace it whole. */
  Set = 'set',
  /** Remove the document. */
  Delete = 'delete',
}
