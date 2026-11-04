import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type IMediaAssetDto } from './i-media-asset';

const STRING_FIELDS = ['publicId', 'format', 'name', 'description', 'uploadedAt'] as const;
const NUMBER_FIELDS = ['version', 'width', 'height', 'bytes'] as const;
const BYTES_PER_MB = 1_048_576;

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

  /** Its size in pixels and on disk, for the library. */
  public get sizeLabel(): string {
    const { width, height, bytes } = this.dto;
    return `${String(width)} × ${String(height)} · ${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
  }

  /**
   * @param fields A stored document.
   * @returns The asset, or `null` when the stored data isn't one (it is then ignored).
   */
  public static fromFields(fields: DocumentFields): MediaAsset | null {
    return isMediaAssetDto(fields) ? new MediaAsset(fields) : null;
  }
}
