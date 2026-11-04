/** Where one file is in the upload queue. */
export enum MediaUploadStatus {
  Waiting = 'waiting',
  Uploading = 'uploading',
  Done = 'done',
  /** Failed in a way that trying again may fix. */
  Failed = 'failed',
  /** Refused before sending: trying the same file again can't work. */
  Invalid = 'invalid',
}
