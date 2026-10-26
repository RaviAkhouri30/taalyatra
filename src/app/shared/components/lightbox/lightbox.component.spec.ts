import { TestBed } from '@angular/core/testing';
import { type IImage } from '@shared/interfaces/i-image';
import { LightboxComponent } from './lightbox.component';

const IMAGES: readonly IImage[] = [
  { src: '/a.jpg', alt: 'First', width: 800, height: 533 },
  { src: '/b.jpg', alt: 'Second', width: 800, height: 533 },
];
const LABELS = {
  label: 'Photo viewer',
  close: 'Close photo viewer',
  previous: 'Previous photo',
  next: 'Next photo',
  caption: '{alt} · {index} of {total}',
};

/** Resolves after the next animation frame. */
function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('LightboxComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(LightboxComponent);
    fixture.componentRef.setInput('images', IMAGES);
    fixture.componentRef.setInput('index', 1);
    fixture.componentRef.setInput('labels', LABELS);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const events = { closed: vi.fn(), previous: vi.fn(), next: vi.fn() };
    fixture.componentInstance.closed.subscribe(events.closed);
    fixture.componentInstance.previous.subscribe(events.previous);
    fixture.componentInstance.next.subscribe(events.next);
    return { fixture, element, events };
  }

  it('should show the photo with its caption in a labelled modal dialog', () => {
    const { element } = render();
    const dialog = element.querySelector('[role="dialog"]');

    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-label')).toBe('Photo viewer');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Second');
    expect(element.querySelector('.lbcap')?.textContent).toBe('Second · 2 of 2');
  });

  it('should move focus to the close button when it opens', async () => {
    const fixture = TestBed.createComponent(LightboxComponent);
    const element = fixture.nativeElement as HTMLElement;
    document.body.append(element); // focus needs the element in the document before rendering
    fixture.componentRef.setInput('images', IMAGES);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('labels', LABELS);
    fixture.detectChanges();
    await fixture.whenStable();
    await nextFrame(); // focus is deferred a frame for WebKit

    expect(document.activeElement).toBe(element.querySelector('.lbx'));
    element.remove();
  });

  it('should not take focus when closed before the deferred focus runs', async () => {
    const fixture = TestBed.createComponent(LightboxComponent);
    const element = fixture.nativeElement as HTMLElement;
    document.body.append(element);
    fixture.componentRef.setInput('images', IMAGES);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('labels', LABELS);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.destroy();
    await nextFrame();

    expect(document.activeElement).toBe(document.body);
    element.remove();
  });

  it('should emit from its buttons and from Escape and the arrow keys', () => {
    const { element, events } = render();
    const press = (key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key }));

    element.querySelector<HTMLButtonElement>('.lbx')!.click();
    element.querySelector<HTMLButtonElement>('.prev')!.click();
    element.querySelector<HTMLButtonElement>('.next')!.click();
    press('Escape');
    press('ArrowLeft');
    press('ArrowRight');
    press('Enter');

    expect(events.closed).toHaveBeenCalledTimes(2);
    expect(events.previous).toHaveBeenCalledTimes(2);
    expect(events.next).toHaveBeenCalledTimes(2);
  });
});
