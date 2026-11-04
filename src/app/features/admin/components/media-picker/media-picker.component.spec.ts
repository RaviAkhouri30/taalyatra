import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IMediaService } from '@core/interfaces/i-media-service';
import { type MediaAsset } from '../../models/media-asset.model';
import { provideEditorTesting } from '../../testing/editor-testing';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { MediaPickerComponent } from './media-picker.component';

describe('MediaPickerComponent', () => {
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

  function render(store: MemoryDocumentStore) {
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        { provide: IDocumentStore, useValue: store },
        { provide: IMediaService, useValue: { upload: vi.fn(), remove: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(MediaPickerComponent);
    const picked: MediaAsset[] = [];
    let cancelled = 0;
    fixture.componentInstance.picked.subscribe((asset) => picked.push(asset));
    fixture.componentInstance.cancelled.subscribe(() => {
      cancelled += 1;
    });
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, picked, cancels: () => cancelled };
  }

  it('should report the image the owner chooses', () => {
    const { element, picked } = render(new MemoryDocumentStore({ 'media/abc': dto }));

    element.querySelector<HTMLButtonElement>('[aria-label="Choose photo.jpg"]')?.click();

    expect(picked.map((asset) => asset.id)).toEqual(['abc']);
  });

  it('should suggest uploading when the library is empty', () => {
    const { element } = render(new MemoryDocumentStore());

    expect(element.querySelector('.mp-note')?.textContent).toContain('Upload one above');
    expect(element.querySelector('app-media-upload')).not.toBeNull();
  });

  it('should say so when the library cannot be loaded', () => {
    const store = new MemoryDocumentStore();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    const { element } = render(store);

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('couldn’t be loaded');
  });

  it('should report cancelling', () => {
    const { element, cancels } = render(new MemoryDocumentStore());

    element.querySelector<HTMLButtonElement>('.mp-cancel')?.click();

    expect(cancels()).toBe(1);
  });
});
