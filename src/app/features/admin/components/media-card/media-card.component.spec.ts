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
    const described: string[] = [];
    fixture.componentInstance.described.subscribe((text) => described.push(text));
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, described };
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
});
