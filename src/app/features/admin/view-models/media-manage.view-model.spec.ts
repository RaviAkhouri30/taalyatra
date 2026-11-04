import { TestBed } from '@angular/core/testing';
import { type Observable, of, throwError } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IMediaService, MediaError, type MediaUploadEvent } from '@core/interfaces/i-media-service';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { MediaAsset } from '../models/media-asset.model';
import { MEDIA_ERROR_TEXT, MEDIA_WRONG_TYPE_TEXT } from '../models/media-upload.constants';
import { MediaUsageService } from '../services/media-usage.service';
import { layoutStub, provideLayout } from '../testing/editor-testing';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { MEDIA_MANAGE_TEXT, MediaManageViewModel } from './media-manage.view-model';

describe('MediaManageViewModel', () => {
  const dto = {
    publicId: 'taal-yatra/media/abc',
    version: 1,
    width: 100,
    height: 100,
    bytes: 10,
    format: 'jpg',
    name: 'photo.jpg',
    description: 'A circle',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  };
  const asset = new MediaAsset(dto);
  const inUse = {
    src: 'v1/taal-yatra/media/abc',
    alt: 'A circle',
    width: 1,
    height: 1,
    order: 0,
  };
  const stored: MediaUploadEvent = {
    kind: MediaUploadEventKind.Uploaded,
    media: { ...dto, publicId: 'taal-yatra/media/new', version: 2 },
  };
  const file = new File(['x'], 'new.jpg');

  function setUp(
    seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = { 'media/abc': dto },
    upload: () => Observable<MediaUploadEvent> = () =>
      of<MediaUploadEvent[]>({ kind: MediaUploadEventKind.Progress, percent: 50 }, stored),
  ) {
    const store = new MemoryDocumentStore(seed);
    const remove = vi.fn(() => of(undefined));
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        MediaManageViewModel,
        provideLayout(layout),
        { provide: IDocumentStore, useValue: store },
        { provide: IMediaService, useValue: { upload, remove } },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-04T00:00:00Z') } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    const model = TestBed.inject(MediaManageViewModel);
    model.init().subscribe();
    return { model, store, remove, layout };
  }

  it('should say where each image is used when it starts', () => {
    const { model } = setUp({ 'media/abc': dto, 'gallery/001': inUse });

    expect(model.usesOf('abc')).toEqual(['Photos · Photo 1']);
    expect(model.usesOf('unused')).toEqual([]);
  });

  it('should still list images when usage cannot be worked out', () => {
    const usages = vi
      .spyOn(MediaUsageService.prototype, 'usages')
      .mockReturnValue(throwError(() => new Error('offline')));

    const { model } = setUp();

    expect(model.data()).toHaveLength(1);
    usages.mockRestore();
  });

  describe('delete', () => {
    it('should refuse while the image is used, checking afresh', () => {
      const { model, store, remove } = setUp();
      store.documents.set('gallery/001', inUse);

      model.askToDelete(asset);

      expect(model.confirmingDelete()).toBeNull();
      expect(model.notice()).toEqual({ id: 'abc', text: MEDIA_MANAGE_TEXT.inUse });
      expect(model.usesOf('abc')).toEqual(['Photos · Photo 1']);
      expect(remove).not.toHaveBeenCalled();
    });

    it('should ask first when the image is unused, and not delete yet', () => {
      const { model, remove } = setUp();

      model.askToDelete(asset);

      expect(model.confirmingDelete()).toBe('abc');
      expect(remove).not.toHaveBeenCalled();
    });

    it('should stop asking when cancelled', () => {
      const { model } = setUp();
      model.askToDelete(asset);

      model.cancelDelete();

      expect(model.confirmingDelete()).toBeNull();
    });

    it('should delete the file first, then the entry', () => {
      const { model, store, remove } = setUp();
      const order: string[] = [];
      remove.mockImplementation(() => {
        order.push(`file, entry stored: ${String(store.documents.has('media/abc'))}`);
        return of(undefined);
      });

      model.confirmDelete(asset);

      expect(remove).toHaveBeenCalledWith('taal-yatra/media/abc');
      expect(order).toEqual(['file, entry stored: true']);
      expect(store.documents.has('media/abc')).toBe(false);
      expect(model.data()).toEqual([]);
      expect(model.busyId()).toBeNull();
    });

    it('should keep the entry and say so when the file cannot be deleted', () => {
      const { model, store, remove } = setUp();
      remove.mockReturnValue(throwError(() => new Error('offline')));

      model.confirmDelete(asset);

      expect(store.documents.has('media/abc')).toBe(true);
      expect(model.notice()?.text).toBe(MEDIA_MANAGE_TEXT.deleteFailed);
      expect(model.busyId()).toBeNull();
    });

    it('should not ask when it cannot check, and work for the next try', () => {
      const { model } = setUp();
      const usages = vi
        .spyOn(TestBed.inject(MediaUsageService), 'usages')
        .mockReturnValueOnce(throwError(() => new Error('offline')));

      model.askToDelete(asset);
      expect(model.confirmingDelete()).toBeNull();
      expect(model.notice()?.text).toBe(MEDIA_MANAGE_TEXT.checkFailed);

      model.askToDelete(asset);
      expect(model.confirmingDelete()).toBe('abc');
      usages.mockRestore();
    });
  });

  describe('replace', () => {
    it('should upload, copy the description, rewrite uses as drafts and report them', () => {
      const { model, store, layout } = setUp({ 'media/abc': dto, 'gallery/001': inUse });

      model.replace(asset, file);

      expect(store.documents.get('media/new')).toMatchObject({
        name: 'new.jpg',
        description: 'A circle',
      });
      expect(store.documents.get('drafts/gallery')).toMatchObject({
        content: { _items: [{ src: 'v2/taal-yatra/media/new' }] },
      });
      expect(store.documents.get('gallery/001')).toEqual(inUse);
      expect(model.notice()).toEqual({ id: 'new', text: MEDIA_MANAGE_TEXT.replaced(1) });
      expect(model.data()?.[0]?.id).toBe('new');
      expect(model.usesOf('new')).toEqual(['Photos · Photo 1']);
      expect(layout.refreshChanges).toHaveBeenCalled();
      expect(model.busyId()).toBeNull();
    });

    it('should count in the plural when several documents change', () => {
      expect(MEDIA_MANAGE_TEXT.replaced(2)).toContain('2 places');
    });

    it('should say there is nothing to review when the image was unused', () => {
      const { model } = setUp();

      model.replace(asset, file);

      expect(model.notice()?.text).toBe(MEDIA_MANAGE_TEXT.replacedUnused);
    });

    it('should refuse a file that is not a photo, without uploading', () => {
      const upload = vi.fn(() => of<MediaUploadEvent>(stored));
      const { model } = setUp({ 'media/abc': dto }, upload);

      model.replace(asset, new File(['x'], 'notes.pdf'));

      expect(upload).not.toHaveBeenCalled();
      expect(model.notice()).toEqual({ id: 'abc', text: MEDIA_WRONG_TYPE_TEXT });
    });

    it('should explain a failed upload and change nothing', () => {
      const { model, store } = setUp({ 'media/abc': dto }, () =>
        throwError(() => new MediaError(MediaErrorKind.Rejected)),
      );

      model.replace(asset, file);

      expect(model.notice()?.text).toBe(MEDIA_ERROR_TEXT[MediaErrorKind.Rejected]);
      expect(store.documents.has('media/new')).toBe(false);
    });

    it('should keep the new file and say so when the uses cannot be rewritten', () => {
      const { model, store } = setUp();
      const replace = vi
        .spyOn(TestBed.inject(MediaUsageService), 'replace')
        .mockReturnValue(throwError(() => new Error('offline')));

      model.replace(asset, file);

      expect(store.documents.has('media/new')).toBe(true);
      expect(model.notice()).toEqual({ id: 'new', text: MEDIA_MANAGE_TEXT.replaceFailed });
      replace.mockRestore();
    });
  });
});
