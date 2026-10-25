import { TestBed } from '@angular/core/testing';
import { PILL_DIYA } from '@shared/constants/promo.constants';
import { DiyaIconComponent } from './diya-icon.component';

describe('DiyaIconComponent', () => {
  it('should draw the lamp in the given palette and size', () => {
    const fixture = TestBed.createComponent(DiyaIconComponent);
    fixture.componentRef.setInput('palette', PILL_DIYA);
    fixture.detectChanges();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    const fills = Array.from(svg.querySelectorAll('path')).map((path) => path.getAttribute('fill'));

    expect(svg.getAttribute('width')).toBe('17');
    expect(fills).toEqual([PILL_DIYA.flame, PILL_DIYA.core, PILL_DIYA.bowl, PILL_DIYA.rim]);
  });
});
