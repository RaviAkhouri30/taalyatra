import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject, type Subscription, throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { type IDraft } from '@core/interfaces/i-draft';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import {
  AUTOSAVE_DEBOUNCE_MS,
  EDITOR_TAB_ROUTE_KEY,
  PREVIEW_FOLLOW_DEBOUNCE_MS,
} from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { DraftService } from '../services/draft.service';
import { SAFETY_COPY_KEY_PREFIX, SafetyCopyService } from '../services/safety-copy.service';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../testing/editor-testing';
import { TEAM_HEADING, VIDEOS_HEADING } from '../schemas/content.sections';
import { EditorPageViewModel, SAFETY_COPY_MESSAGES } from './editor-page.view-model';

describe('EditorPageViewModel', () => {
  let subscription: Subscription;

  function setUp(
    tab: unknown = EditorTab.Hero,
    copies: Readonly<Record<string, object>> = {},
    options: { seed?: Record<string, object>; user?: { uid: string; email: string } } = {},
  ) {
    const testing = provideEditorTesting({
      'home/hero': fakeDb.home.hero,
      'home/videos': fakeDb.home.videos,
      'drafts/home__team': {
        path: 'home/team',
        content: { ...fakeDb.home.team, title: 'Drafted title' },
        savedAt: 'x',
      },
      ...options.seed,
    });
    for (const [path, content] of Object.entries(copies)) {
      testing.localStore.values.set(
        SAFETY_COPY_KEY_PREFIX + path,
        JSON.stringify({ content, savedAt: '2026-10-31T09:00:00.000Z' }),
      );
    }
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(options.user ? provideSignedIn(options.user) : []),
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
    return { model, layout, section, store: testing.store, localStore: testing.localStore };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    subscription.unsubscribe();
    vi.useRealTimers();
  });

  it('should build a card per section, filled from the draft where there is one', () => {
    const { model, section } = setUp(EditorTab.Team);

    expect(model.data()?.tab.label).toBe('Team');
    expect(model.data()?.sections.map((entry) => entry.section.id)).toEqual([
      'team',
      'team-members',
    ]);
    expect(section('team')?.form.get('title')?.value).toBe('Drafted title');
    expect(section('team')?.titleId).toBe('card-team');
    expect(model.activeAnchor()).toBe(PageAnchor.Team);
  });

  it('should fill a card from the live document when there is no draft', () => {
    const { section } = setUp();

    expect(section('hero')?.form.get('title')?.value).toBe('Find your rhythm.');
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

  it('should say it is saving as soon as something changes, before the pause is over', () => {
    const { layout, section } = setUp();

    section('hero')?.form.get('title')?.setValue('Drum');

    expect(layout.reportSaving).toHaveBeenCalled();
    expect(layout.reportSaved).not.toHaveBeenCalled();
  });

  it('should not say saved while a change made during a save is still waiting', () => {
    const { model, layout, section, store } = setUp();
    const firstSave = new Subject<IDraft>();
    const drafts = TestBed.inject(DraftService);
    const realSave = drafts.save.bind(drafts);
    vi.spyOn(drafts, 'save')
      .mockReturnValueOnce(firstSave)
      .mockImplementation((path, content) => realSave(path, content));
    const title = section('hero')?.form.get('title');

    title?.setValue('First');
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
    title?.setValue('Second');
    firstSave.next({ path: 'home/hero', content: {}, savedAt: 'x' });
    firstSave.complete();

    expect(layout.reportSaved).not.toHaveBeenCalled();
    expect(model.hasUnsavedChanges()).toBe(true);

    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);

    expect(store.documents.get('drafts/home__hero')).toMatchObject({
      content: { title: 'Second' },
    });
    expect(layout.reportSaved).toHaveBeenCalledTimes(1);
    expect(model.hasUnsavedChanges()).toBe(false);
  });

  it('should save nothing before the pause is over', () => {
    const { section, store } = setUp();

    section('hero')?.form.get('title')?.setValue('Drum');
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS - 1);

    expect(store.documents.has('drafts/home__hero')).toBe(false);
  });

  it('should report a failed save and keep the change for a retry', () => {
    const { model, layout, section } = setUp(EditorTab.Videos);
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
    const { model } = setUp();

    model.focus(VIDEOS_HEADING);
    model.togglePreview();

    expect(model.activeAnchor()).toBe(PageAnchor.Watch);
    expect(model.previewOpen()).toBe(true);
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

  it('should open the first tab, Hero, for an unknown tab in the route', () => {
    const { model } = setUp('somewhere');

    expect(model.data()?.tab.label).toBe('Hero');
  });

  it('should start from an empty document when one is not stored yet', () => {
    const { section } = setUp(EditorTab.Visibility);

    expect(section('visibility')?.form.get('sections')?.get('gallery')?.value).toBe(true);
  });

  describe('safety copy (0016 V2)', () => {
    const typed = { ...fakeDb.home.hero, title: 'Typed offline' };

    it('should keep a change on this device at once, and drop it once saved', () => {
      const { section } = setUp();
      const safety = TestBed.inject(SafetyCopyService);

      section('hero')?.form.get('title')?.setValue('Typed');
      expect(safety.find('home/hero')?.content).toMatchObject({ title: 'Typed' });
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);

      expect(safety.find('home/hero')).toBeNull();
    });

    it('should keep the change on this device when the save fails', () => {
      const { section } = setUp();
      vi.spyOn(TestBed.inject(DraftService), 'save').mockReturnValue(
        throwError(() => new Error('offline')),
      );

      section('hero')?.form.get('title')?.setValue('Typed offline');
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);

      expect(TestBed.inject(SafetyCopyService).find('home/hero')).not.toBeNull();
    });

    it('should offer back changes that never reached the draft, saying when', () => {
      const { model } = setUp(EditorTab.Hero, { 'home/hero': typed });

      expect(model.unsaved()?.when).toBe('31 Oct 2026, 2:30 pm');
      expect(model.unsaved()?.copies.map((copy) => copy.path)).toEqual(['home/hero']);
    });

    it('should not offer a copy that matches what is stored', () => {
      const { model, localStore } = setUp(EditorTab.Hero, { 'home/hero': fakeDb.home.hero });

      expect(model.unsaved()).toBeNull();
      expect(localStore.values.size).toBe(0);
    });

    it('should put the changes into the draft and reload the page', () => {
      const { model, store, layout, localStore } = setUp(EditorTab.Hero, { 'home/hero': typed });
      const show = vi.spyOn(TestBed.inject(ToastService), 'show');

      model.restoreUnsaved();

      expect(store.documents.get('drafts/home__hero')).toMatchObject({ content: typed });
      expect(model.unsaved()).toBeNull();
      expect(localStore.values.size).toBe(0);
      expect(show).toHaveBeenCalledWith(SAFETY_COPY_MESSAGES.restored);
      expect(layout.resetContent).toHaveBeenCalled();
    });

    it('should keep the changes on this device when restoring fails', () => {
      const { model, localStore } = setUp(EditorTab.Hero, { 'home/hero': typed });
      vi.spyOn(TestBed.inject(DraftService), 'saveAll').mockReturnValue(
        throwError(() => new Error('offline')),
      );
      const show = vi.spyOn(TestBed.inject(ToastService), 'show');

      model.restoreUnsaved();

      expect(show).toHaveBeenCalledWith(SAFETY_COPY_MESSAGES.failed, ToastTone.Error);
      expect(localStore.values.size).toBe(1);
      expect(model.unsaved()).not.toBeNull();
    });

    it('should throw the changes away when asked, and do nothing more after', () => {
      const { model, store, localStore } = setUp(EditorTab.Hero, { 'home/hero': typed });

      model.discardUnsaved();
      model.restoreUnsaved();

      expect(model.unsaved()).toBeNull();
      expect(localStore.values.size).toBe(0);
      expect(store.documents.has('drafts/home__hero')).toBe(false);
    });
  });

  describe('a change waiting for approval (0019)', () => {
    const MANAGER = { uid: 'manager', email: 'm@b.co' };
    const seed = {
      'roles/manager': { email: MANAGER.email, pages: {}, uploads: true, addedAt: 'x' },
      'approvals/r1': {
        by: MANAGER.uid,
        email: MANAGER.email,
        paths: ['home/hero'],
        note: 'New title',
        sentAt: '2026-10-31T09:00:00.000Z',
        status: 'waiting',
      },
    };

    it('should lock the page for the manager, and save nothing', async () => {
      const { model, section, store } = setUp(EditorTab.Hero, {}, { seed, user: MANAGER });
      await vi.runAllTimersAsync();
      const form = section('hero')!.form;

      form.setValue({ ...form.getRawValue() });
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

      expect(model.waiting()).toMatchObject({ locked: true, note: 'New title' });
      expect(form.disabled).toBe(true);
      expect(store.documents.has('drafts/home__hero')).toBe(false);
    });

    it('should tell the owner, who can still change the page', async () => {
      const { model, section } = setUp(EditorTab.Hero, {}, { seed });
      await vi.runAllTimersAsync();

      expect(model.waiting()?.locked).toBe(false);
      expect(section('hero')!.form.enabled).toBe(true);
    });
  });
});
