import { TestBed } from '@angular/core/testing';
import { ICON_REGISTRY } from '@shared/constants/icon-registry.constants';
import { IconName } from '@shared/enums/icon-name.enum';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  function render(name: IconName, size?: number, strokeWidth?: number): SVGElement {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', name);
    if (size) fixture.componentRef.setInput('size', size);
    if (strokeWidth) fixture.componentRef.setInput('strokeWidth', strokeWidth);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('svg')!;
  }

  it('should render a decorative 24px icon by default', () => {
    const svg = render(IconName.Home);

    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('should apply the requested size and stroke width', () => {
    const svg = render(IconName.Phone, 15, 1.9);

    expect(svg.getAttribute('height')).toBe('15');
    expect(svg.getAttribute('stroke-width')).toBe('1.9');
  });

  it.each(Object.values(IconName))('should draw every primitive of "%s"', (name) => {
    const svg = render(name);

    expect(svg.children).toHaveLength(ICON_REGISTRY[name].length);
  });

  it('should draw rect and circle attributes', () => {
    const svg = render(IconName.Instagram);

    expect(svg.querySelector('rect')?.getAttribute('rx')).toBe('5');
    expect(svg.querySelectorAll('circle')).toHaveLength(2);
  });
});
