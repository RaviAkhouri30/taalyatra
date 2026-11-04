import { Injectable, inject, signal } from '@angular/core';
import { type Observable, EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { parseImageSrc } from '../models/image-src';
import { type MediaAsset } from '../models/media-asset.model';
import { MediaLibraryService } from '../services/media-library.service';

/**
 * Finds the stored file behind an image field when the owner crops it. A use only knows its own
 * cropped size, and the crop needs the whole file's.
 */
@Injectable()
export class ImageFieldViewModel extends ViewModel<MediaAsset | null> {
  /** Whether the file couldn't be found or read, so it can't be cropped. */
  public readonly unavailable = signal(false);

  private readonly library = inject(MediaLibraryService);
  private readonly requests = new Subject<string>();

  private readonly logger = inject(LoggerService);

  /** @param src The image's current `src`. */
  public requestCrop(src: string): void {
    this.setData(null);
    this.unavailable.set(false);
    this.requests.next(src);
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // switchMap: only the latest request matters, once the owner has moved on.
    return this.requests.pipe(switchMap((src) => this.find(src)));
  }

  private find(src: string): Observable<unknown> {
    return this.library.asset(parseImageSrc(src)?.id ?? '').pipe(
      tap((asset) => {
        this.unavailable.set(asset === null);
        this.setData(asset);
      }),
      // Inside the switchMap, so one failure can't end the stream for later requests.
      catchError((error: unknown) => {
        this.logger.error('Image lookup failed', error);
        this.unavailable.set(true);
        return EMPTY;
      }),
    );
  }
}
