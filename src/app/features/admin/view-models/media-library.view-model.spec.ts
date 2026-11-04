import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { MediaAsset } from '../models/media-asset.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { MediaLibraryViewModel } from './media-library.view-model';

describe('MediaLibraryViewModel', () => {
  const dto = {
    publicId: 'taal-yatra/media/abc',
    version: 1,
    width: 100,
    height: 100,
    bytes: 10,
    format: 'jpg',
    name: 'photo.jpg',
    description: '',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  };

  function setUp(store = new MemoryDocumentStore({ 'media/abc': dto })) {
    TestBed.configureTestingModule({
      providers: [
        MediaLibraryViewModel,
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-03T10:00:00Z') } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    const model = TestBed.inject(MediaLibraryViewModel);
    model.init().subscribe();
    return { model, store };
  }

  it('should list the stored images when it starts', () => {
    expect(
      setUp()
        .model.data()
        ?.map((asset) => asset.id),
    ).toEqual(['abc']);
  });

  it('should say so when the library cannot be read', () => {
    const store = new MemoryDocumentStore();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    expect(setUp(store).model.loadFailed()).toBe(true);
  });

  it('should put a new upload first', () => {
    const { model } = setUp();

    model.added(new MediaAsset({ ...dto, publicId: 'taal-yatra/media/new' }));

    expect(model.data()?.map((asset) => asset.id)).toEqual(['new', 'abc']);
  });

  it('should add an upload when the library could not list anything yet', () => {
    const store = new MemoryDocumentStore();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));
    const { model } = setUp(store);

    model.added(new MediaAsset(dto));

    expect(model.data()?.length).toBe(1);
  });

  it('should store a description and show it', () => {
    const { model, store } = setUp();
    const asset = new MediaAsset(dto);

    model.describe(asset, '  A drum circle at sunset  ');

    expect(store.documents.get('media/abc')).toMatchObject({
      description: 'A drum circle at sunset',
    });
    expect(model.data()?.[0]?.dto.description).toBe('A drum circle at sunset');
  });

  it('should say so when a description fails, and keep working for the next one', () => {
    const { model, store } = setUp();
    const asset = new MediaAsset(dto);
    vi.spyOn(store, 'commit').mockReturnValueOnce(throwError(() => new Error('offline')));

    model.describe(asset, 'First');
    expect(model.saveFailed()).toBe(true);

    model.describe(asset, 'Second');
    expect(model.saveFailed()).toBe(false);
    expect(store.documents.get('media/abc')).toMatchObject({ description: 'Second' });
  });
});
