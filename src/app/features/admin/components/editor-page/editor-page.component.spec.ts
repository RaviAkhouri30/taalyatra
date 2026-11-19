import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EDITOR_TAB_ROUTE_KEY } from '../../models/editor-nav.constants';
import { EditorTab } from '../../models/editor-tab.enum';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../../testing/editor-testing';
import { EditorPageViewModel } from '../../view-models/editor-page.view-model';
import EditorPageComponent from './editor-page.component';

describe('EditorPageComponent', () => {
  function render(
    seed: Parameters<typeof provideEditorTesting>[0] = {},
    user?: { uid: string; email: string },
  ) {
    const testing = provideEditorTesting(seed);
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(user ? provideSignedIn(user) : []),
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

    expect(element.querySelector('h1')?.textContent).toBe('Offer');
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

  it('should let the preview follow the card scrolled to only while it is beside the form', () => {
    const { fixture, element } = render();
    const model = fixture.debugElement.injector.get(EditorPageViewModel);
    const follow = vi.spyOn(model, 'follow');
    const card = fixture.debugElement.query(
      (node) =>
        node.nativeElement instanceof HTMLElement &&
        node.nativeElement.classList.contains('ep-card'),
    );

    // jsdom has no layout: the preview column has no width, as when phones hide it.
    card.triggerEventHandler('entered');
    expect(follow).not.toHaveBeenCalled();
    Object.defineProperty(element.querySelector('#editor-preview'), 'offsetWidth', { value: 600 });
    card.triggerEventHandler('entered');

    expect(follow).toHaveBeenCalledTimes(1);
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

  it('should show a manager their waiting change and keep the page from changing (0019)', () => {
    const manager = { uid: 'manager', email: 'm@b.co' };
    const { element } = render(
      {
        'roles/manager': { email: manager.email, pages: {}, uploads: true, addedAt: 'x' },
        'approvals/r1': {
          by: manager.uid,
          email: manager.email,
          paths: ['site/config'],
          note: 'New dates',
          sentAt: '2026-10-31T09:00:00.000Z',
          status: 'waiting',
        },
      },
      manager,
    );
    const banner = element.querySelector('.ep-waiting');

    expect(banner?.getAttribute('data-locked')).toBe('true');
    expect(banner?.textContent).toContain('You sent changes on this page for approval');
    expect(element.querySelector('.ep-waiting-note')?.textContent).toBe('“New dates”');
    expect(banner?.querySelector('a')?.getAttribute('href')).toBe('/admin/publish');
    expect(element.querySelector<HTMLFieldSetElement>('fieldset.ep-cards')?.disabled).toBe(true);
  });

  it('should show no banner, and an open page, when nothing waits', () => {
    const { element } = render();

    expect(element.querySelector('.ep-waiting')).toBeNull();
    expect(element.querySelector<HTMLFieldSetElement>('fieldset.ep-cards')?.disabled).toBe(false);
  });
});
