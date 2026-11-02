import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type IMediaAssetDto } from './i-media-asset';

const STRING_FIELDS = ['publicId', 'format', 'name', 'description', 'uploadedAt'] as const;
const NUMBER_FIELDS = ['version', 'width', 'height', 'bytes'] as const;

function isMediaAssetDto(fields: DocumentFields): fields is DocumentFields & IMediaAssetDto {
  const entries = new Map(Object.entries(fields));
  return (
    STRING_FIELDS.every((name) => typeof entries.get(name) === 'string') &&
    NUMBER_FIELDS.every((name) => typeof entries.get(name) === 'number')
  );
}

/** An uploaded image in the library. */
export class MediaAsset {
  /** @param dto The stored entry. */
  public constructor(public readonly dto: IMediaAssetDto) {}

  /** Its document's id: the random last part of the stored file's id. */
  public get id(): string {
    return this.dto.publicId.split('/').at(-1) ?? '';
  }

  /** What `IImage.src` holds for this file when it's used uncropped (D14). */
  public get src(): string {
    return `v${String(this.dto.version)}/${this.dto.publicId}`;
  }

  /**
   * @param fields A stored document.
   * @returns The asset, or `null` when the stored data isn't one (it is then ignored).
   */
  public static fromFields(fields: DocumentFields): MediaAsset | null {
    return isMediaAssetDto(fields) ? new MediaAsset(fields) : null;
  }
}
