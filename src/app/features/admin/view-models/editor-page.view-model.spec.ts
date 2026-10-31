import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { type Subscription, throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { AUTOSAVE_DEBOUNCE_MS, EDITOR_TAB_ROUTE_KEY } from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { DraftService } from '../services/draft.service';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
import { EditorPageViewModel } from './editor-page.view-model';

describe('EditorPageViewModel', () => {
  let subscription: Subscription;

  function setUp(tab: unknown = EditorTab.Content) {
    const testing = provideEditorTesting({
      'home/hero': fakeDb.home.hero,
      'home/videos': fakeDb.home.videos,
      'drafts/home__team': {
        path: 'home/team',
        content: { ...fakeDb.home.team, title: 'Drafted title' },
        savedAt: 'x',
      },
    });
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layout),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { [EDITOR_TAB_ROUTE_KEY]: tab } } },
        },
        EditorPageViewModel,
      ],
    });
    const model = TestBed.inject(EditorPageViewModel);
    subscription = model.init().subscribe();
    const section = (id: string) => model.data()?.sections.find((entry) => entry.section.id === id);
    return { model, layout, section, store: testing.store };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it('should build a card per section, filled from the draft where there is one', () => {
    const { model, section } = setUp();

    expect(model.data()?.tab.label).toBe('Page content');
    expect(section('hero')?.form.get('title')?.value).toBe('Find your rhythm.');
    expect(section('team')?.form.get('title')?.value).toBe('Drafted title');
    expect(section('hero')?.titleId).toBe('card-hero');
    expect(model.activeAnchor()).toBe(PageAnchor.Top);
  });

  it('should save a change to the draft after the pause, keeping the fields it does not edit', () => {
    const { model, layout, section, store } = setUp();

    section('hero')?.form.get('title')?.setValue('Drum with us.');
    expect(model.hasUnsavedChanges()).toBe(true);
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);

    expect(store.documents.get('drafts/home__hero')).toMatchObject({
      path: 'home/hero',
      content: { ...fakeDb.home.hero, title: 'Drum with us.' },
    });
    expect(layout.reportSaving).toHaveBeenCalled();
    expect(layout.reportSaved).toHaveBeenCalled();
    expect(model.previewVersion()).toBe(1);
    expect(model.hasUnsavedChanges()).toBe(false);
  });

  it('should save nothing before the pause is over', () => {
    const { section, store } = setUp();

    section('hero')?.form.get('title')?.setValue('Drum');
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS - 1);

    expect(store.documents.has('drafts/home__hero')).toBe(false);
  });

  it('should report a failed save and keep the change for a retry', () => {
    const { model, layout, section } = setUp();
    const save = vi
      .spyOn(TestBed.inject(DraftService), 'save')
      .mockReturnValueOnce(throwError(() => new Error('offline')));

    section('videos')?.form.get('title')?.setValue('Watch');
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
    expect(layout.reportFailed).toHaveBeenCalled();
    expect(model.hasUnsavedChanges()).toBe(true);

    layout.retries$.next();

    expect(
      save.mock.calls.some(
        ([path, content]) => path === 'home/videos' && content['title'] === 'Watch',
      ),
    ).toBe(true);
    expect(layout.reportSaved).toHaveBeenCalled();
  });

  it('should follow the section being edited and switch the preview on phones', () => {
    const { model, section } = setUp();

    model.focus(section('videos')!.section);
    model.togglePreview();

    expect(model.activeAnchor()).toBe(PageAnchor.Watch);
    expect(model.previewOpen()).toBe(true);
  });

  it('should open the offer tab for an unknown tab in the route', () => {
    const { model } = setUp('somewhere');

    expect(model.data()?.tab.label).toBe('Offer & theme');
  });

  it('should start from an empty document when one is not stored yet', () => {
    const { section } = setUp(EditorTab.Visibility);

    expect(section('visibility')?.form.get('sections')?.get('gallery')?.value).toBe(true);
  });
});
