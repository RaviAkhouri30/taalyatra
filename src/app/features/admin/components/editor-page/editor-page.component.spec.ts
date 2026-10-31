import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EDITOR_TAB_ROUTE_KEY } from '../../models/editor-nav.constants';
import { EditorTab } from '../../models/editor-tab.enum';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import EditorPageComponent from './editor-page.component';

describe('EditorPageComponent', () => {
  function render() {
    const testing = provideEditorTesting();
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layout),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { [EDITOR_TAB_ROUTE_KEY]: EditorTab.Offer } } },
        },
      ],
    });
    const fixture = TestBed.createComponent(EditorPageComponent);
    fixture.detectChanges();
    return { fixture, layout, element: fixture.nativeElement as HTMLElement };
  }

  it('should show the tab with a named card per section and the live preview', () => {
    const { element } = render();
    const cards = Array.from(element.querySelectorAll('section.ep-card'));

    expect(element.querySelector('h1')?.textContent).toBe('Offer & theme');
    expect(cards.map((card) => card.querySelector('h2')?.textContent)).toEqual([
      'Offer switch and dates',
      'Offer section',
    ]);
    expect(cards[0]?.getAttribute('aria-labelledby')).toBe('card-promotion');
    expect(element.querySelector('app-preview-frame')).not.toBeNull();
  });

  it('should switch between the form and the preview on phones', () => {
    const { fixture, element } = render();
    const toggle = element.querySelector<HTMLButtonElement>('.ep-toggle')!;

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.ep')?.classList).toContain('ep--preview');
  });

  it('should ask the browser to confirm closing only while a change could be lost', () => {
    const { fixture, layout } = render();
    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(leave()).toBe(false);
    layout.failed.set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    expect(leave()).toBe(true);
  });
});
