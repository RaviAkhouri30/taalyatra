import { Injectable, computed, inject } from '@angular/core';
import {
  type Observable,
  EMPTY,
  Subject,
  catchError,
  concatMap,
  defer,
  filter,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import {
  type IUploadedMedia,
  IMediaService,
  MediaError,
  type MediaUploadEvent,
} from '@core/interfaces/i-media-service';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { type IMediaUploadItem } from '../models/i-media-upload-item';
import { type MediaAsset } from '../models/media-asset.model';
import { mediaFileRefusal } from '../models/media-file';
import { MediaUploadStatus } from '../models/media-upload-status.enum';
import { MEDIA_ERROR_TEXT, MEDIA_UPLOAD_CONCURRENCY } from '../models/media-upload.constants';
import { MediaLibraryService } from '../services/media-library.service';

/**
 * The upload queue (D13): checks each file, sends a few at a time, reports progress, and stores
 * each finished file in the library. One failure never stops the others.
 */
@Injectable()
export class MediaUploadViewModel extends ViewModel<readonly IMediaUploadItem[]> {
  /** Every file in the list. */
  public readonly items = computed(() => this.data() ?? []);

  /** Read by screen readers as uploads progress. */
  public readonly summary = computed(() => {
    const items = this.items();
    const done = items.filter((item) => item.status === MediaUploadStatus.Done).length;
    return items.length === 0 ? '' : `${String(done)} of ${String(items.length)} uploaded.`;
  });

  /** Each new library entry, once it's stored. */
  public readonly uploaded$: Observable<MediaAsset>;

  private readonly media = inject(IMediaService);
  private readonly library = inject(MediaLibraryService);
  private readonly logger = inject(LoggerService);

  private readonly queue = new Subject<number>();
  private readonly finished = new Subject<MediaAsset>();
  private readonly files = new Map<number, File>();
  /** Stored files whose library entry failed: a retry mustn't upload them a second time. */
  private readonly unregistered = new Map<number, IUploadedMedia>();
  private nextId = 1;

  public constructor() {
    super();
    this.uploaded$ = this.finished.asObservable();
  }

  /** @param files The files the owner chose or dropped. */
  public add(files: readonly File[]): void {
    for (const file of files) {
      const message = mediaFileRefusal(file);
      const id = this.nextId;
      this.nextId += 1;
      this.setData([
        ...this.items(),
        {
          id,
          name: file.name,
          status: message === '' ? MediaUploadStatus.Waiting : MediaUploadStatus.Invalid,
          percent: 0,
          message,
        },
      ]);
      if (message === '') {
        this.files.set(id, file);
        this.queue.next(id);
      }
    }
  }

  /** @param id A failed file's id. */
  public retry(id: number): void {
    this.patch(id, { status: MediaUploadStatus.Waiting, percent: 0, message: '' });
    this.queue.next(id);
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // mergeMap with a limit: at most this many uploads at once, and the rest wait their turn.
    return this.queue.pipe(mergeMap((id) => this.process(id), MEDIA_UPLOAD_CONCURRENCY));
  }

  private process(id: number): Observable<void> {
    const file = this.files.get(id);
    return file === undefined
      ? EMPTY
      : this.stored(id, file).pipe(
          // concatMap: a single stored file, then its one library entry.
          concatMap((media) => {
            this.unregistered.set(id, media);
            return this.library.register(media, file.name);
          }),
          tap((asset) => {
            this.unregistered.delete(id);
            this.files.delete(id);
            this.patch(id, { status: MediaUploadStatus.Done, percent: 100 });
            this.finished.next(asset);
          }),
          map(() => undefined),
          // Inside the queue's mergeMap, so one failure can't end the stream for other files.
          catchError((error: unknown) => {
            this.logger.error('Media upload failed', error);
            this.patch(id, {
              status: MediaUploadStatus.Failed,
              message: MEDIA_ERROR_TEXT[MediaError.kindOf(error)],
            });
            return EMPTY;
          }),
        );
  }

  private stored(id: number, file: File): Observable<IUploadedMedia> {
    return defer(() => {
      const earlier = this.unregistered.get(id);
      if (earlier !== undefined) {
        return of(earlier);
      }
      this.patch(id, { status: MediaUploadStatus.Uploading });
      return this.media.upload(file).pipe(
        tap((event) => {
          if (event.kind === MediaUploadEventKind.Progress) {
            this.patch(id, { percent: event.percent });
          }
        }),
        filter(
          (event): event is MediaUploadEvent & { kind: MediaUploadEventKind.Uploaded } =>
            event.kind === MediaUploadEventKind.Uploaded,
        ),
        map((event) => event.media),
      );
    });
  }

  private patch(id: number, change: Partial<IMediaUploadItem>): void {
    this.setData(this.items().map((item) => (item.id === id ? { ...item, ...change } : item)));
  }
}
