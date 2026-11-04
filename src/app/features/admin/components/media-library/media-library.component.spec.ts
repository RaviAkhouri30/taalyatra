import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IMediaService } from '@core/interfaces/i-media-service';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import MediaLibraryComponent from './media-library.component';

describe('MediaLibraryComponent', () => {
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
  const upload = vi.fn(() =>
    of({
      kind: MediaUploadEventKind.Uploaded,
      media: { ...dto, publicId: 'taal-yatra/media/new' },
    }),
  );

  function render(seed: Parameters<typeof provideEditorTesting>[0], store?: MemoryDocumentStore) {
    const testing = provideEditorTesting(seed);
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layoutStub()),
        { provide: IMediaService, useValue: { upload, remove: () => of(undefined) } },
        ...(store ? [{ provide: IDocumentStore, useValue: store }] : []),
      ],
    });
    const fixture = TestBed.createComponent(MediaLibraryComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should invite the first upload when the library is empty', () => {
    const { element } = render({});

    expect(element.querySelector('h1')?.textContent).toBe('Media library');
    expect(element.querySelector('.ml-empty')?.textContent).toContain('No photos yet');
  });

  it('should show one card per stored image', () => {
    const { element } = render({ 'media/abc': dto });

    expect(element.querySelectorAll('app-media-card')).toHaveLength(1);
    expect(element.querySelector('.ml-count')?.textContent).toBe('1 photo');
  });

  it('should count in the plural when there are several', () => {
    const { element } = render({
      'media/abc': dto,
      'media/def': { ...dto, publicId: 'taal-yatra/media/def' },
    });

    expect(element.querySelector('.ml-count')?.textContent).toBe('2 photos');
  });

  it('should show a new upload straight away', async () => {
    const { fixture, element } = render({});
    const input = element.querySelector('input[type="file"]')!;
    Object.defineProperty(input, 'files', {
      value: [new File(['x'], 'new.jpg')],
      configurable: true,
    });

    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(element.querySelectorAll('app-media-card')).toHaveLength(1);
  });

  it('should save a description changed on a card', async () => {
    const store = new MemoryDocumentStore({ 'media/abc': dto });
    const { fixture, element } = render({}, store);
    const field = element.querySelector('textarea')!;

    field.value = 'A circle';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(store.documents.get('media/abc')).toMatchObject({ description: 'A circle' });
  });

  it('should say so when a description cannot be saved', async () => {
    const store = new MemoryDocumentStore({ 'media/abc': dto });
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('offline')));
    const { fixture, element } = render({}, store);
    const field = element.querySelector('textarea')!;

    field.value = 'A circle';
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('couldn’t be saved');
  });

  it('should say so when the library cannot be loaded', () => {
    const store = new MemoryDocumentStore();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    const { element } = render({}, store);

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('couldn’t be loaded');
  });

  it('should say where an image is used, and refuse to delete it', async () => {
    const { fixture, element } = render({
      'media/abc': dto,
      'gallery/001': {
        src: 'v1/taal-yatra/media/abc',
        alt: 'A circle',
        width: 1,
        height: 1,
        order: 0,
      },
    });
    await fixture.whenStable();
    expect(element.querySelector('.mc-uses li')?.textContent).toBe('Photos · Photo 1');

    element.querySelector<HTMLButtonElement>('[aria-label="Delete photo.jpg"]')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.mc-notice')?.textContent).toContain('can’t be deleted');
    expect(element.querySelector('.mc-danger')).toBeNull();
  });

  it('should confirm before deleting an unused image, then remove it', async () => {
    const { fixture, element } = render({ 'media/abc': dto });
    element.querySelector<HTMLButtonElement>('[aria-label="Delete photo.jpg"]')?.click();
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('.mc-danger')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.ml-empty')).not.toBeNull();
  });
});
