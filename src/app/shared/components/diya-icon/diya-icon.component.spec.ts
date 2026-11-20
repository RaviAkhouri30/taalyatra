import { TestBed } from '@angular/core/testing';
import { CARD_DIYA, PILL_DIYA } from '@shared/constants/promo.constants';
import { DiyaIconComponent } from './diya-icon.component';

function render(palette: typeof PILL_DIYA): HTMLElement {
  const fixture = TestBed.createComponent(DiyaIconComponent);
  fixture.componentRef.setInput('palette', palette);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('DiyaIconComponent', () => {
  it('should draw the lamp at the given size with its four parts when given a palette', () => {
    const host = render(PILL_DIYA);
    const svg = host.querySelector('svg')!;
    const parts = Array.from(svg.querySelectorAll('path')).map((path) =>
      path.getAttribute('class'),
    );

    expect(svg.getAttribute('width')).toBe('17');
    expect(parts).toEqual(['flame', 'core', 'bowl', 'rim']);
  });

  it('should mark its colouring on the host when given the card palette', () => {
    const host = render(CARD_DIYA);

    expect(host.classList).toContain('diya--card');
  });
});
