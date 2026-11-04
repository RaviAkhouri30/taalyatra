import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { SaveStatus } from '../../models/save-status.enum';
import { MediaLibraryService } from '../../services/media-library.service';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import { PUBLISH_BAR_MESSAGES } from '../../view-models/publish-bar.view-model';
import { PublishBarComponent } from './publish-bar.component';

describe('PublishBarComponent', () => {
  const heroDraft = {
    path: 'home/hero',
    content: { ...fakeDb.home.hero, title: 'New' },
    savedAt: 'x',
  };
  const brokenDraft = {
    path: 'home/hero',
    content: { ...fakeDb.home.hero, title: '' },
    savedAt: 'x',
  };

  function render(seed: Parameters<typeof provideEditorTesting>[0] = {}) {
    const testing = provideEditorTesting(seed);
    const layout = layoutStub();
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layout),
        { provide: ToastService, useValue: { show } },
      ],
    });
    const fixture = TestBed.createComponent(PublishBarComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) => candidate.textContent.trim() === name,
      );
    const status = () => element.querySelector('[role="status"]')?.textContent;
    return { fixture, element, button, status, layout, show, store: testing.store };
  }

  it('should say everything is published, with nothing to press', () => {
    const { button, status } = render();

    expect(status()).toBe('All changes published.');
    expect(button('Publish')?.disabled).toBe(true);
    expect(button('Discard')?.disabled).toBe(true);
  });

  it('should count unpublished changes and allow publishing them', () => {
    const { button, status } = render({ 'drafts/home__hero': heroDraft });

    expect(status()).toBe('1 unpublished change.');
    expect(button('Publish')?.disabled).toBe(false);
  });

  it('should count in the plural', () => {
    const { status } = render({
      'drafts/home__hero': heroDraft,
      'drafts/home__team': { path: 'home/team', content: fakeDb.home.team, savedAt: 'x' },
    });

    expect(status()).toBe('2 unpublished changes.');
  });

  it('should publish, say so, and recount', async () => {
    const { fixture, button, store, layout, show } = render({ 'drafts/home__hero': heroDraft });

    button('Publish')?.click();
    await fixture.whenStable();

    expect(store.documents.get('home/hero')).toMatchObject({ title: 'New' });
    expect(store.documents.has('drafts/home__hero')).toBe(false);
    expect(show).toHaveBeenCalledWith(PUBLISH_BAR_MESSAGES.published);
    expect(layout.refreshChanges).toHaveBeenCalled();
  });

  it('should say so when publishing fails', async () => {
    const { fixture, button, store, show } = render({ 'drafts/home__hero': heroDraft });
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('offline')));

    button('Publish')?.click();
    await fixture.whenStable();

    expect(show).toHaveBeenCalledWith(PUBLISH_BAR_MESSAGES.publishFailed, ToastTone.Error);
    expect(button('Publish')?.disabled).toBe(false);
  });

  it('should show what to fix, link to the review page and block publishing', () => {
    const { element, button } = render({ 'drafts/home__hero': brokenDraft });

    expect(element.querySelector('a')?.textContent.trim()).toBe('1 to fix before publishing');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/admin/publish');
    expect(button('Publish')?.disabled).toBe(true);
  });

  it('should still work when the media library cannot be read', () => {
    vi.spyOn(MediaLibraryService.prototype, 'assets').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    const { button } = render({ 'drafts/home__hero': heroDraft });

    expect(button('Publish')?.disabled).toBe(false);
  });

  it('should keep the last picture when the drafts cannot be read', async () => {
    const { fixture, status, store, layout } = render({ 'drafts/home__hero': heroDraft });
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    layout.changes$.next();
    await fixture.whenStable();

    expect(status()).toBe('1 unpublished change.');
  });

  it('should recheck when the drafts change', async () => {
    const { fixture, status, store, layout } = render();

    store.documents.set('drafts/home__hero', heroDraft);
    layout.changes$.next();
    await fixture.whenStable();

    expect(status()).toBe('1 unpublished change.');
  });

  it('should follow a save in progress, and hold publishing until it is done', async () => {
    const { fixture, button, status, layout } = render({ 'drafts/home__hero': heroDraft });

    layout.status.set(SaveStatus.Saving);
    await fixture.whenStable();

    expect(status()).toBe('Saving…');
    expect(button('Publish')?.disabled).toBe(true);

    layout.status.set(SaveStatus.Saved);
    await fixture.whenStable();

    expect(status()).toContain('Saved in your draft');
    expect(button('Publish')?.disabled).toBe(false);
  });

  it('should say all published after a save that left no drafts', async () => {
    const { fixture, status, layout } = render();

    layout.status.set(SaveStatus.Saved);
    await fixture.whenStable();

    expect(status()).toBe('All changes published.');
  });

  it('should offer a retry after a failed save, and hold publishing', async () => {
    const { fixture, button, status, layout } = render({ 'drafts/home__hero': heroDraft });

    layout.status.set(SaveStatus.Failed);
    await fixture.whenStable();
    expect(status()).toContain('Couldn’t save');
    expect(button('Publish')?.disabled).toBe(true);

    button('Retry')?.click();

    expect(layout.retry).toHaveBeenCalled();
  });

  describe('discard', () => {
    it('should ask first, and keep everything when told to', async () => {
      const { fixture, button, store } = render({ 'drafts/home__hero': heroDraft });

      button('Discard')?.click();
      await fixture.whenStable();
      expect(store.documents.has('drafts/home__hero')).toBe(true);

      button('Keep')?.click();
      await fixture.whenStable();

      expect(button('Discard')).toBeDefined();
      expect(store.documents.has('drafts/home__hero')).toBe(true);
    });

    it('should throw the drafts away and tell the page to reload', async () => {
      const { fixture, button, store, layout, show } = render({ 'drafts/home__hero': heroDraft });
      button('Discard')?.click();
      await fixture.whenStable();

      button('Yes, discard')?.click();
      await fixture.whenStable();

      expect(store.documents.has('drafts/home__hero')).toBe(false);
      expect(layout.resetContent).toHaveBeenCalled();
      expect(show).toHaveBeenCalledWith(PUBLISH_BAR_MESSAGES.discarded);
    });

    it('should say so when it fails, and keep working', async () => {
      const { fixture, button, store, layout, show } = render({ 'drafts/home__hero': heroDraft });
      const commit = vi
        .spyOn(store, 'commit')
        .mockReturnValueOnce(throwError(() => new Error('offline')));
      button('Discard')?.click();
      await fixture.whenStable();

      button('Yes, discard')?.click();
      await fixture.whenStable();

      expect(show).toHaveBeenCalledWith(PUBLISH_BAR_MESSAGES.discardFailed, ToastTone.Error);
      expect(layout.resetContent).not.toHaveBeenCalled();
      commit.mockRestore();
    });
  });

  it('should ignore a second publish while one is running', async () => {
    const { fixture, button, store } = render({ 'drafts/home__hero': heroDraft });
    const pending = new Subject<void>();
    const commit = vi.spyOn(store, 'commit').mockReturnValue(pending);

    button('Publish')?.click();
    await fixture.whenStable();

    expect(button('Publishing…')?.disabled).toBe(true);
    expect(commit).toHaveBeenCalledTimes(1);
  });
});
