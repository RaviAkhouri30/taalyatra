/** Where the editor's autosave stands, shown in the editor's status line. */
export enum SaveStatus {
  /** Nothing changed yet in this visit. */
  Idle = 'idle',
  /** A change is being saved to the draft. */
  Saving = 'saving',
  /** The last change is in the draft. */
  Saved = 'saved',
  /** The last save failed; the change is still in the form. */
  Failed = 'failed',
}
