import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { LoggerService } from '@core/services/logger.service';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { ImageFieldViewModel } from './image-field.view-model';

describe('ImageFieldViewModel', () => {
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
        ImageFieldViewModel,
        { provide: IDocumentStore, useValue: store },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    const model = TestBed.inject(ImageFieldViewModel);
    model.init().subscribe();
    return model;
  }

  it('should find the stored file behind a cropped image', () => {
    const model = setUp();

    model.requestCrop('c_crop,x_1,y_2,w_30,h_30/v1/taal-yatra/media/abc');

    expect(model.data()?.id).toBe('abc');
    expect(model.unavailable()).toBe(false);
  });

  it.each(['v1/taal-yatra/media/gone', '/images/local.webp'])(
    'should say the file is unavailable when %s is not in the library',
    (src) => {
      const model = setUp();

      model.requestCrop(src);

      expect(model.unavailable()).toBe(true);
    },
  );

  it('should say so when the library fails, and work for the next request', () => {
    const store = new MemoryDocumentStore({ 'media/abc': dto });
    vi.spyOn(store, 'read').mockReturnValueOnce(throwError(() => new Error('offline')));
    const model = setUp(store);

    model.requestCrop('v1/taal-yatra/media/abc');
    expect(model.unavailable()).toBe(true);

    model.requestCrop('v1/taal-yatra/media/abc');
    expect(model.unavailable()).toBe(false);
    expect(model.data()?.id).toBe('abc');
  });
});
