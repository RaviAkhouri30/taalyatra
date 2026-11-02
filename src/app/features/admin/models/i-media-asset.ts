import { type IUploadedMedia } from '@core/interfaces/i-media-service';

/** Where the upload library lives (admin-only in `firestore.rules`). */
export const MEDIA_COLLECTION = 'media';

/** A library entry (`media/{id}`, D11). */
export interface IMediaAssetDto extends IUploadedMedia {
  /** The file's name when it was uploaded. */
  readonly name: string;
  /** Offered as the description wherever the image is used. */
  readonly description: string;
  /** When it was uploaded (ISO 8601). */
  readonly uploadedAt: string;
}
