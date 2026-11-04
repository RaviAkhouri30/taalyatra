import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { MediaErrorKind } from '@core/enums/media-error-kind.enum';
import { MediaUploadEventKind } from '@core/enums/media-upload-event-kind.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { IMediaService, MediaError, type MediaUploadEvent } from '@core/interfaces/i-media-service';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { type MediaAsset } from '../../models/media-asset.model';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { MediaUploadComponent } from './media-upload.component';

describe('MediaUploadComponent', () => {
  const stored: MediaUploadEvent = {
    kind: MediaUploadEventKind.Uploaded,
    media: {
      publicId: 'taal-yatra/media/a',
      version: 1,
      width: 1,
      height: 1,
      bytes: 1,
      format: 'jpg',
    },
  };
  const photo = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

  function render(upload = vi.fn(() => of(stored))) {
    TestBed.configureTestingModule({
      providers: [
        { provide: IMediaService, useValue: { upload, remove: vi.fn() } },
        { provide: IDocumentStore, useValue: new MemoryDocumentStore() },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-03T10:00:00Z') } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(MediaUploadComponent);
    const uploaded: MediaAsset[] = [];
    fixture.componentInstance.uploaded.subscribe((asset) => uploaded.push(asset));
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, uploaded, upload };
  }

  /** A drag event carrying files, which jsdom can't build itself. */
  function dragEvent(type: string, files: File[] = []): Event {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    return event;
  }

  /** Puts files on the input and fires its change event, as choosing them does. */
  function choose(element: HTMLElement, files: File[]): HTMLInputElement {
    const input = element.querySelector('input')!;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    return input;
  }

  it('should offer a real file input for several photos', () => {
    const input = render().element.querySelector('input');

    expect(input?.type).toBe('file');
    expect(input?.multiple).toBe(true);
    expect(input?.accept).toContain('.heic');
  });

  it('should upload what is chosen, list it and tell the page', async () => {
    const { fixture, element, uploaded } = render();

    choose(element, [photo]);
    await fixture.whenStable();

    expect(element.querySelector('.mu-name')?.textContent).toBe('photo.jpg');
    expect(element.querySelector('[role="status"]')?.textContent).toBe('1 of 1 uploaded.');
    expect(uploaded.map((asset) => asset.id)).toEqual(['a']);
  });

  it('should cope when the browser reports no chosen files', () => {
    const { element, upload } = render();
    const input = element.querySelector('input')!;
    Object.defineProperty(input, 'files', { value: null, configurable: true });

    input.dispatchEvent(new Event('change'));

    expect(upload).not.toHaveBeenCalled();
  });

  it('should show the zone as a target while a file is dragged over it', async () => {
    const { fixture, element } = render();
    const zone = element.querySelector('.mu-zone')!;
    const over = dragEvent('dragover');

    zone.dispatchEvent(over);
    await fixture.whenStable();
    expect(over.defaultPrevented).toBe(true);
    expect(zone.classList).toContain('mu-zone--over');

    zone.dispatchEvent(dragEvent('dragleave'));
    await fixture.whenStable();
    expect(zone.classList).not.toContain('mu-zone--over');
  });

  it('should upload a dropped file rather than let the browser open it', async () => {
    const { fixture, element, upload } = render();
    const zone = element.querySelector('.mu-zone')!;
    const drop = dragEvent('drop', [photo]);

    zone.dispatchEvent(drop);
    await fixture.whenStable();

    expect(drop.defaultPrevented).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('should cope when a drop has no files', () => {
    const { element, upload } = render();
    const drop = new Event('drop', { bubbles: true, cancelable: true });

    element.querySelector('.mu-zone')?.dispatchEvent(drop);

    expect(upload).not.toHaveBeenCalled();
  });

  it('should explain a failure and offer to try again', async () => {
    const upload = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new MediaError(MediaErrorKind.Unavailable)))
      .mockReturnValue(of(stored));
    const { fixture, element } = render(upload);

    choose(element, [photo]);
    await fixture.whenStable();
    expect(element.querySelector('.mu-error')?.textContent).toContain('didn’t finish');

    element.querySelector<HTMLButtonElement>('.mu-retry')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.mu-state')?.textContent).toBe('Uploaded');
  });

  it('should explain a refused file and offer no retry', async () => {
    const { fixture, element } = render();

    choose(element, [new File(['x'], 'notes.pdf')]);
    await fixture.whenStable();

    expect(element.querySelector('.mu-error')?.textContent).toContain('isn’t a photo');
    expect(element.querySelector('.mu-retry')).toBeNull();
  });

  it('should show progress and waiting states while files are in the queue', async () => {
    const upload = vi.fn(() => new Observable<MediaUploadEvent>());
    const { fixture, element } = render(upload);

    choose(element, [photo, photo, photo, photo]);
    await fixture.whenStable();

    expect(element.querySelectorAll('progress')).toHaveLength(3);
    expect(element.querySelector('.mu-state')?.textContent).toBe('Waiting');
  });
});
