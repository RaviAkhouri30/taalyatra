import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { buildFormGroup } from '../../forms/schema-control.factory';
import { SectionPanel } from '../../models/section-panel.enum';
import { THEME_SECTION } from '../../schemas/theme.sections';
import { SavedThemesService } from '../../services/saved-themes.service';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { SAVED_THEME_DOCUMENT, SAVED_THEME_PATH } from '../../testing/saved-theme.fixture';
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
  function render(panel: SectionPanel, seed: Record<string, DocumentFields> = {}) {
    TestBed.configureTestingModule({
      providers: [
        SavedThemesService,
        { provide: IDocumentStore, useValue: new MemoryDocumentStore(seed) },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.panel.set(panel);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it('should offer the ready-made themes, dark then light, the current one pressed', () => {
    const { element } = render(SectionPanel.ThemePresets);
    const groups = Array.from(element.querySelectorAll('.tp-group legend'));
    const swatches = Array.from(element.querySelectorAll('.tp-swatch'));

    expect(groups.map((legend) => legend.textContent.trim())).toEqual(['Dark', 'Light']);
    expect(swatches).toHaveLength(16);
    expect(swatches.slice(0, 4).map((swatch) => swatch.textContent.trim())).toEqual([
      'Warm night',
      'Festival',
      'High contrast',
      'Indigo night',
    ]);
    expect(swatches.filter((swatch) => swatch.getAttribute('aria-pressed') === 'true')).toEqual([
      swatches[0],
    ]);
    expect(element.querySelector('.tp-current')?.textContent).toContain('Warm night');
  });

  it('should list the saved themes first when there are any', () => {
    const { element } = render(SectionPanel.ThemePresets, {
      [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT,
    });
    const groups = Array.from(element.querySelectorAll('.tp-group legend'));

    expect(groups.map((legend) => legend.textContent.trim())).toEqual([
      'Your themes',
      'Dark',
      'Light',
    ]);
    expect(element.querySelector('.tp-swatch')?.textContent.trim()).toBe('Spring show');
  });

  it('should fill the form from a saved theme when its swatch is clicked', () => {
    const { fixture, host, element } = render(SectionPanel.ThemePresets, {
      [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT,
    });

    element.querySelector<HTMLButtonElement>('.tp-swatch')?.click();
    fixture.detectChanges();

    expect(host.form.get('fonts')?.value).toBe('space-work');
    expect(element.querySelector('.tp-swatch')?.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelector('.tp-current')?.textContent).toContain('Your theme: Spring show');
  });

  it('should show the Your themes panel when it is that panel', () => {
    const { element } = render(SectionPanel.ThemeSaved);

    expect(element.querySelector('app-saved-themes-panel')).not.toBeNull();
  });

  it('should fill the form when a ready-made theme is clicked', () => {
    const { fixture, host, element } = render(SectionPanel.ThemePresets);

    // High contrast, third in the Dark group.
    element.querySelectorAll<HTMLButtonElement>('.tp-swatch')[2]?.click();
    fixture.detectChanges();

    expect(host.form.get('background')?.value).toBe('#000000');
    expect(element.querySelectorAll('.tp-swatch')[2]?.getAttribute('aria-pressed')).toBe('true');
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
