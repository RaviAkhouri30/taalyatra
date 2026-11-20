import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { buildFormGroup } from '../../forms/schema-control.factory';
import { SectionPanel } from '../../models/section-panel.enum';
import { THEME_SECTION } from '../../schemas/theme.sections';
import { ThemePanelComponent } from './theme-panel.component';

@Component({
  imports: [ThemePanelComponent],
  template: '<app-theme-panel [panel]="panel()" [form]="form" />',
})
class HostComponent {
  public readonly panel = signal(SectionPanel.ThemePresets);
  public readonly form = buildFormGroup(THEME_SECTION.fields, {});
}

describe('ThemePanelComponent', () => {
  function render(panel: SectionPanel) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.panel.set(panel);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it('should offer every ready-made theme, the current one pressed', () => {
    const { element } = render(SectionPanel.ThemePresets);
    const swatches = Array.from(element.querySelectorAll('.tp-swatch'));

    expect(swatches.map((swatch) => swatch.textContent.trim())).toEqual([
      'Warm night',
      'Daylight',
      'Festival',
      'High contrast',
    ]);
    expect(swatches.map((swatch) => swatch.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
      'false',
    ]);
  });

  it('should fill the form when a ready-made theme is clicked', () => {
    const { fixture, host, element } = render(SectionPanel.ThemePresets);

    element.querySelectorAll<HTMLButtonElement>('.tp-swatch')[3]?.click();
    fixture.detectChanges();

    expect(host.form.get('background')?.value).toBe('#000000');
    expect(element.querySelectorAll('.tp-swatch')[3]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should say every pair is readable when the theme is today’s look', () => {
    const { element } = render(SectionPanel.ThemeContrast);

    expect(element.querySelector('.tp-summary')?.textContent).toContain('easy to read');
    expect(element.querySelector('.tp-failing')).toBeNull();
  });

  it('should list each failing pair with its fix when a colour is hard to read', () => {
    const { fixture, host, element } = render(SectionPanel.ThemeContrast);

    host.form.get('quietText')?.setValue('#3a3a3a');
    fixture.detectChanges();

    expect(element.querySelector('.tp-summary')?.textContent).toContain('hard to read');
    expect(element.querySelector('.tp-failing li')?.textContent).toContain(
      'Make the quiet text lighter.',
    );
    expect(element.querySelectorAll('.tp-all .tp-fail').length).toBeGreaterThan(0);
  });

  it('should put today’s look back when Reset is clicked', () => {
    const { fixture, host, element } = render(SectionPanel.ThemeReset);
    host.form.get('background')?.setValue('#000000');

    element.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();

    expect(host.form.get('background')?.value).toBe('#171210');
  });
});
