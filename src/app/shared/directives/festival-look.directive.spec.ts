import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Festival } from '@shared/enums/festival.enum';
import { FestivalLookDirective } from './festival-look.directive';

@Component({
  imports: [FestivalLookDirective],
  template: '<div [appFestivalLook]="festival()"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly festival = signal(Festival.Holi);
}

describe('FestivalLookDirective', () => {
  function render(festival: Festival): HTMLElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.festival.set(festival);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('div') as HTMLElement;
  }

  it('should give the host the festival’s colours when it has its own', () => {
    const host = render(Festival.Holi);

    expect(host.classList).toContain('festival-look');
    expect(host.style.getPropertyValue('--fest-base')).toBe('#e4428f');
    expect(host.style.getPropertyValue('--fest-glow')).toBe('#f2b705');
    expect(host.style.getPropertyValue('--fest-text')).toBe('#2a0b18');
  });

  it('should leave the theme’s colours when the festival keeps them', () => {
    const host = render(Festival.Diwali);

    expect(host.classList).not.toContain('festival-look');
    expect(host.style.getPropertyValue('--fest-base')).toBe('');
  });
});
