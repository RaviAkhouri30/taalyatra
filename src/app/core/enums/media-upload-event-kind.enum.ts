/** What an upload's event reports. */
export enum MediaUploadEventKind {
  /** More of the file has been sent. */
  Progress = 'progress',
  /** The file is stored. Always the last event. */
  Uploaded = 'uploaded',
}
