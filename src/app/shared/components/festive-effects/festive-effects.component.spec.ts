import { TestBed } from '@angular/core/testing';
import { FESTIVE_PARTICLES } from '@shared/constants/festive.constants';
import { FestiveTheme } from '@shared/enums/festive-theme.enum';
import { queryAll } from '@shared/testing/fixtures';
import { FestiveEffectsComponent } from './festive-effects.component';

describe('FestiveEffectsComponent', () => {
  function render(theme?: FestiveTheme): HTMLElement {
    const fixture = TestBed.createComponent(FestiveEffectsComponent);
    if (theme) fixture.componentRef.setInput('theme', theme);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should draw nothing by default', () => {
    expect(render().querySelector('.fx')).toBeNull();
  });

  it('should draw every particle for the sparks theme, positioned from the layout', () => {
    const element = render(FestiveTheme.Sparks);
    const particles = queryAll(element, '.fp');
    const first = FESTIVE_PARTICLES[0]!;

    expect(element.querySelector('.fx')?.classList).toContain('a-sparks');
    expect(element.querySelector('.fx')?.getAttribute('aria-hidden')).toBe('true');
    expect(particles).toHaveLength(FESTIVE_PARTICLES.length);
    expect(particles[0]?.style.getPropertyValue('--l')).toBe(`${String(first.left)}%`);
    expect(particles[0]?.style.getPropertyValue('--t')).toBe(`${String(first.top)}%`);
    expect(particles[0]?.style.getPropertyValue('--d')).toBe(`${String(first.delay)}s`);
  });
});
