import { TestBed } from '@angular/core/testing';
import { THEME_PRESETS } from '@shared/constants/theme.constants';
import { ThemeSwatchComponent } from './theme-swatch.component';

describe('ThemeSwatchComponent', () => {
  it('should carry the theme’s colours and stay hidden from screen readers when given a theme', () => {
    const fixture = TestBed.createComponent(ThemeSwatchComponent);
    fixture.componentRef.setInput('preset', THEME_PRESETS[1]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.style.getPropertyValue('--sw-bg')).toBe('#faf6f0');
    expect(host.style.getPropertyValue('--sw-accent')).toBe('#974912');
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
