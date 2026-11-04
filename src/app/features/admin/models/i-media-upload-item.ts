import { type MediaUploadStatus } from './media-upload-status.enum';

/** One file in the upload list. */
export interface IMediaUploadItem {
  /** Identifies this attempt in the list; two files can share a name. */
  readonly id: number;
  readonly name: string;
  readonly status: MediaUploadStatus;
  /** How much has been sent, 0 to 100. */
  readonly percent: number;
  /** Why it failed; empty otherwise. */
  readonly message: string;
}
