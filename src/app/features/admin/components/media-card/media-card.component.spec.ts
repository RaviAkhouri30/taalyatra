import { TestBed } from '@angular/core/testing';
import { MediaAsset } from '../../models/media-asset.model';
import { MediaCardComponent } from './media-card.component';

describe('MediaCardComponent', () => {
  const asset = new MediaAsset({
    publicId: 'taal-yatra/media/abc',
    version: 1,
    width: 2400,
    height: 1800,
    bytes: 1_572_864,
    format: 'jpg',
    name: 'photo.jpg',
    description: 'A circle',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  });

  function render() {
    const fixture = TestBed.createComponent(MediaCardComponent);
    fixture.componentRef.setInput('asset', asset);
    fixture.componentRef.setInput('uses', []);
    const described: string[] = [];
    const replaced: File[] = [];
    const events: string[] = [];
    const card = fixture.componentInstance;
    card.described.subscribe((text) => described.push(text));
    card.replaced.subscribe((file) => replaced.push(file));
    card.deleteAsked.subscribe(() => events.push('asked'));
    card.deleteConfirmed.subscribe(() => events.push('confirmed'));
    card.deleteCancelled.subscribe(() => events.push('cancelled'));
    fixture.detectChanges();
    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
      described,
      replaced,
      events,
    };
  }

  it('should show the image with its name, size and description', () => {
    const { element } = render();

    expect(element.querySelector('img')?.alt).toBe('A circle');
    expect(element.querySelector('.mc-name')?.textContent).toBe('photo.jpg');
    expect(element.querySelector('.mc-size')?.textContent).toBe('2400 × 1800 · 1.5 MB');
    expect(element.querySelector('textarea')?.value).toBe('A circle');
  });

  it('should label the description field for screen readers', () => {
    const { element } = render();

    expect(element.querySelector('label')?.htmlFor).toBe(element.querySelector('textarea')?.id);
  });

  it('should emit the new description when the owner changes it', () => {
    const { element, described } = render();
    const field = element.querySelector('textarea')!;

    field.value = 'A circle at sunset';
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('change'));

    expect(described).toEqual(['A circle at sunset']);
  });

  it('should say where it is used, or that it is not', async () => {
    const { fixture, element } = render();
    expect(element.textContent).toContain('Not used on the site.');

    fixture.componentRef.setInput('uses', ['Photos · Photo 1']);
    await fixture.whenStable();

    expect(element.querySelector('.mc-uses li')?.textContent).toBe('Photos · Photo 1');
  });

  it('should report the chosen replacement and let the same file be chosen again', () => {
    const { element, replaced } = render();
    const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['x'], 'new.jpg');
    Object.defineProperty(input, 'files', {
      value: { item: () => file },
      configurable: true,
    });

    input.dispatchEvent(new Event('change'));

    expect(replaced).toEqual([file]);
  });

  it('should report nothing when the file picker is closed without a file', () => {
    const { element, replaced } = render();
    const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: null, configurable: true });

    input.dispatchEvent(new Event('change'));

    expect(replaced).toEqual([]);
  });

  it('should ask to delete, then confirm or cancel', async () => {
    const { fixture, element, events } = render();
    element.querySelector<HTMLButtonElement>('[aria-label="Delete photo.jpg"]')?.click();
    expect(events).toEqual(['asked']);

    fixture.componentRef.setInput('confirming', true);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.mc-danger')?.click();
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent === 'Cancel')
      ?.click();

    expect(events).toEqual(['asked', 'confirmed', 'cancelled']);
  });

  it('should disable its actions and show a message while busy', async () => {
    const { fixture, element } = render();

    fixture.componentRef.setInput('busy', true);
    fixture.componentRef.setInput('notice', 'Done.');
    await fixture.whenStable();

    expect(element.querySelector<HTMLButtonElement>('.mc-actions button')?.disabled).toBe(true);
    expect(element.querySelector('.mc-replace')?.textContent).toContain('Working…');
    expect(element.querySelector('[role="status"]')?.textContent).toBe('Done.');
  });
});
