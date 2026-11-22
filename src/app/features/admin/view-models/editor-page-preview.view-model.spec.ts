import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { type Subscription } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { EDITOR_TAB_ROUTE_KEY, PREVIEW_FOLLOW_DEBOUNCE_MS } from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { TEAM_HEADING, VIDEOS_HEADING } from '../schemas/content.sections';
import { TEAM_PAGE_SECTION } from '../schemas/inner-pages.sections';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
import { EditorPageViewModel } from './editor-page.view-model';

/** Where the editor page points the live preview: the page and section being edited. */
describe('EditorPageViewModel · the preview', () => {
  let subscription: Subscription;

  function setUp() {
    const testing = provideEditorTesting({ 'home/hero': fakeDb.home.hero });
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layoutStub()),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { [EDITOR_TAB_ROUTE_KEY]: EditorTab.Hero } } },
        },
        EditorPageViewModel,
      ],
    });
    const model = TestBed.inject(EditorPageViewModel);
    subscription = model.init().subscribe();
    return { model };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it('should follow the section being edited and switch the preview on phones', () => {
    const { model } = setUp();

    model.focus(VIDEOS_HEADING);
    model.togglePreview();

    expect(model.activeAnchor()).toBe(PageAnchor.Watch);
    expect(model.previewOpen()).toBe(true);
  });

  it('should keep the preview on the card being worked in while other cards scroll by', () => {
    const { model } = setUp();
    model.focus(TEAM_PAGE_SECTION);

    model.follow(TEAM_HEADING);
    vi.advanceTimersByTime(PREVIEW_FOLLOW_DEBOUNCE_MS);
    expect(model.activePage()).toBe(AppRoute.Team);
    model.blur();
    model.follow(TEAM_HEADING);
    vi.advanceTimersByTime(PREVIEW_FOLLOW_DEBOUNCE_MS);

    expect(model.activePage()).toBe(AppRoute.Home);
  });

  it('should show the page of a card scrolled to, and the home page again for a home card', () => {
    const { model } = setUp();
    model.follow(TEAM_PAGE_SECTION);
    vi.advanceTimersByTime(PREVIEW_FOLLOW_DEBOUNCE_MS);
    expect(model.activePage()).toBe(AppRoute.Team);

    model.focus(TEAM_HEADING);

    expect(model.activePage()).toBe(AppRoute.Home);
  });

  it('should move the preview to the card scrolled to once scrolling pauses', () => {
    const { model } = setUp();

    model.follow(VIDEOS_HEADING);
    expect(model.activeAnchor()).toBe(PageAnchor.Top);
    vi.advanceTimersByTime(PREVIEW_FOLLOW_DEBOUNCE_MS);

    expect(model.activeAnchor()).toBe(PageAnchor.Watch);
  });

  it('should move the preview once, to the last card, after a quick scroll past several', () => {
    const { model } = setUp();
    const moves: PageAnchor[] = [];
    TestBed.runInInjectionContext(() => {
      effect(() => {
        moves.push(model.activeAnchor());
      });
    });

    model.follow(VIDEOS_HEADING);
    model.follow(TEAM_HEADING);
    vi.advanceTimersByTime(PREVIEW_FOLLOW_DEBOUNCE_MS);
    TestBed.tick();

    expect(moves.at(-1)).toBe(PageAnchor.Team);
    expect(moves).not.toContain(PageAnchor.Watch);
  });
});
