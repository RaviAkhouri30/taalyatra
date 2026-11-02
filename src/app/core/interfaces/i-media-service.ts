import { type Observable } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { type MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';

/** A stored file, as the provider reports it. */
export interface IUploadedMedia {
  readonly publicId: string;
  readonly version: number;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly format: string;
}

/** One step of an upload: progress, then the stored file last. */
export type MediaUploadEvent =
  | { readonly kind: MediaUploadEventKind.Progress; readonly percent: number }
  | { readonly kind: MediaUploadEventKind.Uploaded; readonly media: IUploadedMedia };

/** A failed media request, with a provider-independent reason. */
export class MediaError extends Error {
  public constructor(public readonly kind: MediaErrorKind) {
    super(`Media request failed: ${kind}`);
    this.name = 'MediaError';
  }

  /**
   * @param error Anything a media call failed with.
   * @returns Its kind, or `Unavailable` when it isn't a `MediaError`.
   */
  public static kindOf(error: unknown): MediaErrorKind {
    return error instanceof MediaError ? error.kind : MediaErrorKind.Unavailable;
  }
}

/**
 * Port for storing images (CLAUDE.md §3, D9). Also the DI token; `mediaServiceFactory` picks the
 * Cloudinary adapter or the fake one. Provided only on the admin routes, so public pages never load
 * an adapter. Every call is a cold Observable; failures are `MediaError`s.
 */
export abstract class IMediaService {
  /**
   * @param file The photo the owner chose.
   * @returns Progress events, then the stored file.
   */
  public abstract upload(file: File): Observable<MediaUploadEvent>;

  /**
   * @param publicId The stored file's id. Deleting one that's already gone counts as done.
   * @returns Emits once and completes when it's gone.
   */
  public abstract remove(publicId: string): Observable<void>;
}
