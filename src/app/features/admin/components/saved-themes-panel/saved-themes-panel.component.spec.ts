import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { buildFormGroup } from '../../forms/schema-control.factory';
import { THEME_SECTION } from '../../schemas/theme.sections';
import { SavedThemesService } from '../../services/saved-themes.service';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { SAVED_THEME_DOCUMENT, SAVED_THEME_PATH } from '../../testing/saved-theme.fixture';
import { SavedThemesPanelComponent } from './saved-themes-panel.component';

@Component({
  imports: [SavedThemesPanelComponent],
  template: '<app-saved-themes-panel [form]="form" [failing]="failing()" />',
})
class HostComponent {
  public readonly failing = signal(0);
  public readonly form = buildFormGroup(THEME_SECTION.fields, {});
}

describe('SavedThemesPanelComponent', () => {
  function render(seed: Record<string, DocumentFields> = {}) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [SavedThemesService, { provide: IDocumentStore, useValue: store }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    // The list is read by the Themes panel beside it; here, by hand.
    TestBed.inject(SavedThemesService).load().subscribe();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (entry) => (entry.getAttribute('aria-label') ?? entry.textContent.trim()) === name,
      );
    return { fixture, element, store, button };
  }

  it('should list each saved theme with Rename and Delete', () => {
    const { element, button } = render({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });

    expect(element.querySelector('.st-name b')?.textContent).toBe('Spring show');
    expect(button('Rename Spring show')).toBeDefined();
    expect(button('Delete Spring show')).toBeDefined();
  });

  it('should show the name’s problem beside the field when Save is pressed without one', () => {
    const { fixture, element, button } = render();

    button('Save as my theme')?.click();
    fixture.detectChanges();

    const input = element.querySelector('#st-name');
    expect(element.querySelector('#st-name-error')?.textContent).toBe('Give the theme a name.');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe('st-name-error');
  });

  it('should say why it can’t save when pairs are hard to read', () => {
    const { fixture, element, button } = render();
    fixture.componentInstance.failing.set(1);
    fixture.detectChanges();
    const input = element.querySelector<HTMLInputElement>('#st-name')!;
    input.value = 'Spring show';
    input.dispatchEvent(new Event('input'));

    button('Save as my theme')?.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('hard-to-read pair');
  });

  it('should show the rename field, then the list again, when Rename is cancelled', () => {
    const { fixture, element, button } = render({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });

    button('Rename Spring show')?.click();
    fixture.detectChanges();
    expect(element.querySelector<HTMLInputElement>('[id^="st-rename-"]')?.value).toBe(
      'Spring show',
    );
    button('Cancel')?.click();
    fixture.detectChanges();

    expect(element.querySelector('[id^="st-rename-"]')).toBeNull();
  });

  it('should ask before deleting, and delete when confirmed', () => {
    const { fixture, element, store, button } = render({
      [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT,
    });

    button('Delete Spring show')?.click();
    fixture.detectChanges();
    expect(element.querySelector('.st-confirm')?.textContent).toContain('The site keeps its theme');
    button('Yes, delete')?.click();
    fixture.detectChanges();

    expect(store.documents.has(SAVED_THEME_PATH)).toBe(false);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Deleted Spring show');
  });

  it('should say when the saved themes couldn’t be read', () => {
    const { fixture, element } = render();
    TestBed.inject(SavedThemesService).loadFailed.set(true);
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Couldn’t load');
  });
});
