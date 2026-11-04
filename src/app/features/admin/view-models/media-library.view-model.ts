import { Injectable, inject, signal } from '@angular/core';
import { type Observable, EMPTY, Subject, catchError, concatMap, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { type MediaAsset } from '../models/media-asset.model';
import { MediaLibraryService } from '../services/media-library.service';

/** One description change from a library card. */
interface IDescriptionChange {
  readonly asset: MediaAsset;
  readonly description: string;
}

/** The media library page: every uploaded image and its description (G5). */
@Injectable()
export class MediaLibraryViewModel extends ViewModel<readonly MediaAsset[]> {
  /** Whether the library couldn't be read. */
  public readonly loadFailed = signal(false);
  /** Whether the last description couldn't be saved. */
  public readonly saveFailed = signal(false);

  private readonly library = inject(MediaLibraryService);
  private readonly logger = inject(LoggerService);
  private readonly descriptions = new Subject<IDescriptionChange>();

  /** @param asset A file that just finished uploading. */
  public added(asset: MediaAsset): void {
    this.setData([asset, ...(this.data() ?? [])]);
  }

  /**
   * @param asset The image to describe.
   * @param description What it shows, for people who can't see it.
   */
  public describe(asset: MediaAsset, description: string): void {
    this.descriptions.next({ asset, description });
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.library.assets().pipe(
      tap((assets) => {
        this.setData(assets);
      }),
      catchError((error: unknown) => {
        this.logger.error('Media library failed to load', error);
        this.loadFailed.set(true);
        return EMPTY;
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // concatMap: saves run in order, so the owner's last description is the one stored.
    return this.descriptions.pipe(concatMap((change) => this.save(change)));
  }

  private save({ asset, description }: IDescriptionChange): Observable<unknown> {
    return this.library.describe(asset, description).pipe(
      tap((saved) => {
        this.saveFailed.set(false);
        this.setData((this.data() ?? []).map((item) => (item.id === saved.id ? saved : item)));
      }),
      // Inside the concatMap, so one failed save can't end the stream for later ones.
      catchError((error: unknown) => {
        this.logger.error('Image description failed to save', error);
        this.saveFailed.set(true);
        return EMPTY;
      }),
    );
  }
}
