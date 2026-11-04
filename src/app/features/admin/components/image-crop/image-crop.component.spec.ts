import { TestBed } from '@angular/core/testing';
import { type CropFrame } from '../../models/crop-frame.model';
import { MediaAsset } from '../../models/media-asset.model';
import { ImageCropComponent } from './image-crop.component';

describe('ImageCropComponent', () => {
  const asset = new MediaAsset({
    publicId: 'taal-yatra/media/abc',
    version: 1,
    width: 1000,
    height: 1000,
    bytes: 10,
    format: 'jpg',
    name: 'photo.jpg',
    description: '',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  });

  function render(src = 'c_crop,x_250,y_250,w_500,h_500/v1/taal-yatra/media/abc') {
    const fixture = TestBed.createComponent(ImageCropComponent);
    fixture.componentRef.setInput('asset', asset);
    fixture.componentRef.setInput('aspect', 1);
    fixture.componentRef.setInput('src', src);
    const applied: CropFrame[] = [];
    let cancelled = 0;
    fixture.componentInstance.applied.subscribe((frame) => applied.push(frame));
    fixture.componentInstance.cancelled.subscribe(() => {
      cancelled += 1;
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const frameBox = element.querySelector<HTMLElement>('.ic-frame')!;
    frameBox.setPointerCapture = vi.fn();
    const apply = () => {
      element.querySelector<HTMLButtonElement>('.ic-apply')?.click();
      return applied.at(-1)?.rect;
    };
    return { fixture, element, frameBox, apply, cancels: () => cancelled };
  }

  const pointer = (type: string, clientX: number, clientY: number) =>
    new MouseEvent(type, { clientX, clientY, bubbles: true });

  it('should show the frame where the earlier crop was', () => {
    const { frameBox } = render();

    expect(frameBox.style.left).toBe('25%');
    expect(frameBox.style.width).toBe('50%');
  });

  it('should start with the largest centred frame when there is no crop', () => {
    expect(render('v1/taal-yatra/media/abc').apply()).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });

  it.each([
    ['Move the frame up', { x: 250, y: 230 }],
    ['Move the frame left', { x: 230, y: 250 }],
    ['Move the frame right', { x: 270, y: 250 }],
    ['Move the frame down', { x: 250, y: 270 }],
  ])('should nudge the frame with the "%s" button, with no dragging', (label, expected) => {
    const { element, apply } = render();

    element.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)?.click();

    expect(apply()).toMatchObject(expected);
  });

  it.each([
    ['ArrowUp', { x: 250, y: 230 }],
    ['ArrowLeft', { x: 230, y: 250 }],
    ['ArrowRight', { x: 270, y: 250 }],
    ['ArrowDown', { x: 250, y: 270 }],
  ])('should move the frame with %s, without scrolling the page', (key, expected) => {
    const { frameBox, apply } = render();
    const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });

    frameBox.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(apply()).toMatchObject(expected);
  });

  it('should leave other keys alone', () => {
    const { frameBox, apply } = render();
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });

    frameBox.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(apply()).toMatchObject({ x: 250, y: 250 });
  });

  it('should follow a drag at the image scale, and stop when released', () => {
    const { element, frameBox, apply } = render();
    // On screen the 1000 px image is 500 px wide, so a 10 px drag is 20 px of file.
    vi.spyOn(element.querySelector('.ic-stage')!, 'getBoundingClientRect').mockReturnValue({
      width: 500,
    } as DOMRect);

    frameBox.dispatchEvent(pointer('pointerdown', 100, 100));
    frameBox.dispatchEvent(pointer('pointermove', 110, 95));
    frameBox.dispatchEvent(pointer('pointerup', 110, 95));
    frameBox.dispatchEvent(pointer('pointermove', 400, 400));

    expect(apply()).toMatchObject({ x: 270, y: 240 });
  });

  it('should ignore pointer movement when no drag has started', () => {
    const { frameBox, apply } = render();

    frameBox.dispatchEvent(pointer('pointermove', 400, 400));

    expect(apply()).toMatchObject({ x: 250, y: 250 });
  });

  it('should zoom with the slider around the same centre', () => {
    const { element, apply } = render();
    const slider = element.querySelector<HTMLInputElement>('input[type="range"]')!;

    slider.value = '4';
    slider.dispatchEvent(new Event('input'));

    expect(apply()).toEqual({ x: 375, y: 375, width: 250, height: 250 });
  });

  it('should label the slider and report cancelling', () => {
    const { element, cancels } = render();

    expect(element.querySelector('label')?.textContent).toContain('Zoom');
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent === 'Cancel')
      ?.click();

    expect(cancels()).toBe(1);
  });
});
