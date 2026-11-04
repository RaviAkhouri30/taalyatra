import { TestBed } from '@angular/core/testing';
import { Subject, type Observable, of, throwError } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IMediaService, MediaError, type MediaUploadEvent } from '@core/interfaces/i-media-service';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { MediaUploadStatus } from '../models/media-upload-status.enum';
import {
  MEDIA_ERROR_TEXT,
  MEDIA_MAX_FILE_BYTES,
  MEDIA_TOO_LARGE_TEXT,
  MEDIA_WRONG_TYPE_TEXT,
} from '../models/media-upload.constants';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { MediaUploadViewModel } from './media-upload.view-model';

describe('MediaUploadViewModel', () => {
  const stored = (id: string): MediaUploadEvent => ({
    kind: MediaUploadEventKind.Uploaded,
    media: {
      publicId: `taal-yatra/media/${id}`,
      version: 1,
      width: 100,
      height: 100,
      bytes: 10,
      format: 'jpg',
    },
  });
  const photo = (name = 'photo.jpg') => new File(['x'], name, { type: 'image/jpeg' });

  function setUp(upload: (file: File) => Observable<MediaUploadEvent>) {
    const store = new MemoryDocumentStore();
    const remove = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        MediaUploadViewModel,
        { provide: IMediaService, useValue: { upload: vi.fn(upload), remove } },
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-03T10:00:00Z') } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    const model = TestBed.inject(MediaUploadViewModel);
    const media = TestBed.inject(IMediaService) as unknown as {
      upload: ReturnType<typeof vi.fn>;
    };
    const subscription = model.init().subscribe();
    return { model, store, media, subscription };
  }

  it('should store each finished file in the library and announce it', () => {
    const { model, store } = setUp(() => of(stored('a')));
    const uploaded: string[] = [];
    model.uploaded$.subscribe((asset) => uploaded.push(asset.id));

    model.add([photo()]);

    expect(model.items()[0]).toMatchObject({ status: MediaUploadStatus.Done, percent: 100 });
    expect(store.documents.has('media/a')).toBe(true);
    expect(uploaded).toEqual(['a']);
    expect(model.summary()).toBe('1 of 1 uploaded.');
  });

  it('should have nothing to announce when no file was chosen', () => {
    expect(setUp(() => of(stored('a'))).model.summary()).toBe('');
  });

  it('should show progress while a file is uploading', () => {
    const events = new Subject<MediaUploadEvent>();
    const { model } = setUp(() => events);

    model.add([photo()]);
    events.next({ kind: MediaUploadEventKind.Progress, percent: 40 });

    expect(model.items()[0]).toMatchObject({ status: MediaUploadStatus.Uploading, percent: 40 });
  });

  it('should run three uploads at once and start the next when one finishes', () => {
    const uploads: Subject<MediaUploadEvent>[] = [];
    const { model, media } = setUp(() => {
      const upload = new Subject<MediaUploadEvent>();
      uploads.push(upload);
      return upload;
    });

    model.add([photo('1.jpg'), photo('2.jpg'), photo('3.jpg'), photo('4.jpg')]);

    expect(media.upload).toHaveBeenCalledTimes(3);
    expect(model.items()[3]?.status).toBe(MediaUploadStatus.Waiting);

    uploads[0]?.next(stored('a'));
    uploads[0]?.complete();

    expect(media.upload).toHaveBeenCalledTimes(4);
  });

  it.each([
    ['a file that is not a photo', new File(['x'], 'notes.pdf'), MEDIA_WRONG_TYPE_TEXT],
    [
      'a file over the limit',
      new File([new ArrayBuffer(MEDIA_MAX_FILE_BYTES + 1)], 'huge.jpg'),
      MEDIA_TOO_LARGE_TEXT,
    ],
  ])('should refuse %s without sending it', (_case, file, message) => {
    const { model, media } = setUp(() => of(stored('a')));

    model.add([file]);

    expect(media.upload).not.toHaveBeenCalled();
    expect(model.items()[0]).toMatchObject({ status: MediaUploadStatus.Invalid, message });
  });

  it('should accept a HEIC file when the browser reports no type for it', () => {
    const { model, media } = setUp(() => of(stored('a')));

    model.add([new File(['x'], 'IMG_0001.HEIC')]);

    expect(media.upload).toHaveBeenCalledTimes(1);
  });

  it('should keep the other uploads going when one fails', () => {
    const { model } = setUp((file) =>
      file.name === 'bad.jpg'
        ? throwError(() => new MediaError(MediaErrorKind.Rejected))
        : of(stored('a')),
    );

    model.add([photo('bad.jpg'), photo('good.jpg')]);

    expect(model.items().map((item) => item.status)).toEqual([
      MediaUploadStatus.Failed,
      MediaUploadStatus.Done,
    ]);
    expect(model.items()[0]?.message).toBe(MEDIA_ERROR_TEXT[MediaErrorKind.Rejected]);
  });

  it('should upload again when a failed file is retried', () => {
    let attempts = 0;
    const { model } = setUp(() => {
      attempts += 1;
      return attempts === 1
        ? throwError(() => new MediaError(MediaErrorKind.Unavailable))
        : of(stored('a'));
    });
    model.add([photo()]);

    model.retry(model.items()[0]?.id ?? 0);

    expect(attempts).toBe(2);
    expect(model.items()[0]).toMatchObject({ status: MediaUploadStatus.Done, message: '' });
  });

  it('should not upload a second time when only saving the library entry failed', () => {
    const { model, store, media } = setUp(() => of(stored('a')));
    const commit = vi
      .spyOn(store, 'commit')
      .mockReturnValueOnce(throwError(() => new Error('offline')));
    model.add([photo()]);
    expect(model.items()[0]?.status).toBe(MediaUploadStatus.Failed);
    commit.mockRestore();

    model.retry(model.items()[0]?.id ?? 0);

    expect(media.upload).toHaveBeenCalledTimes(1);
    expect(store.documents.has('media/a')).toBe(true);
    expect(model.items()[0]?.status).toBe(MediaUploadStatus.Done);
  });

  it('should do nothing when an unknown file is retried', () => {
    const { model, media } = setUp(() => of(stored('a')));

    model.retry(99);

    expect(media.upload).not.toHaveBeenCalled();
  });
});
