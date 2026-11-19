import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { MediaLibraryService } from '../services/media-library.service';
import { PublishService } from '../services/publish.service';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../testing/editor-testing';
import { BACKUP_MESSAGES } from './backup-download';
import { PUBLISH_MESSAGES, PublishPageViewModel } from './publish-page.view-model';

describe('PublishPageViewModel', () => {
  const heroDraft = {
    path: 'home/hero',
    content: { ...fakeDb.home.hero, title: 'New' },
    savedAt: '2026-10-31T09:00:00.000Z',
  };

  function setUp(
    seed: Record<string, Record<string, unknown>> = {},
    user?: { uid: string; email: string },
  ) {
    const testing = provideEditorTesting({
      'home/hero': fakeDb.home.hero,
      'drafts/home__hero': heroDraft,
      ...seed,
    });
    const layout = layoutStub();
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(user ? provideSignedIn(user) : []),
        provideLayout(layout),
        { provide: ToastService, useValue: { show } },
        PublishPageViewModel,
      ],
    });
    const model = TestBed.inject(PublishPageViewModel);
    model.init().subscribe();
    return { model, layout, show, files: testing.files, store: testing.store };
  }

  it('should load the drafts with their checks', () => {
    const { model } = setUp();

    expect(model.data()?.changes.map((change) => change.title)).toEqual(['Hero']);
    expect(model.report()?.canPublish).toBe(true);
  });

  it('should still load, skipping that check, when the media library cannot be read', () => {
    vi.spyOn(MediaLibraryService.prototype, 'assets').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    const { model } = setUp();

    expect(model.data()?.changes.map((change) => change.title)).toEqual(['Hero']);
    expect(model.report()?.canPublish).toBe(true);
  });

  it('should publish after confirmation, then reload, recount and say so', () => {
    const { model, layout, show, store } = setUp();

    model.askToPublish();
    expect(model.confirming()).toBe(true);
    model.publish();

    expect(store.documents.get('home/hero')).toMatchObject({ title: 'New' });
    expect(show).toHaveBeenCalledWith(PUBLISH_MESSAGES.published);
    expect(model.confirming()).toBe(false);
    expect(model.data()?.changes).toEqual([]);
    expect(model.data()?.history).toHaveLength(1);
    expect(layout.refreshChanges).toHaveBeenCalled();
    expect(model.busy()).toBe(false);
  });

  it('should say when publishing fails and keep the drafts', () => {
    const { model, show } = setUp();
    vi.spyOn(TestBed.inject(PublishService), 'publish').mockReturnValue(
      throwError(() => new Error('offline')),
    );

    model.publish();

    expect(show).toHaveBeenCalledWith(PUBLISH_MESSAGES.publishFailed, ToastTone.Error);
    expect(model.data()?.changes).toHaveLength(1);
  });

  it('should throw a draft away', () => {
    const { model, show } = setUp();

    model.discard('home/hero');

    expect(model.data()?.changes).toEqual([]);
    expect(show).toHaveBeenCalledWith(PUBLISH_MESSAGES.discarded);
  });

  it('should go back to before a publish, into the draft, after confirmation', () => {
    const { model, show, store } = setUp();
    model.publish();
    const record = model.data()!.history[0]!.record;

    model.askToGoBack(record);
    expect(model.goingBack()).toBe(record.id);
    model.goBack(record);

    expect(store.documents.get('drafts/home__hero')).toMatchObject({ content: fakeDb.home.hero });
    expect(show).toHaveBeenLastCalledWith(PUBLISH_MESSAGES.restored);
    expect(model.goingBack()).toBeNull();
  });

  it('should offer a backup once a publish is done', () => {
    const { model } = setUp();
    expect(model.justPublished()).toBe(false);

    model.publish();

    expect(model.justPublished()).toBe(true);
  });

  it('should download a backup, saying so, and stop suggesting one', () => {
    const { model, show, files } = setUp();
    model.publish();

    model.downloadBackup();

    expect(files.downloads).toHaveLength(1);
    expect(show).toHaveBeenLastCalledWith(BACKUP_MESSAGES.kept);
    expect(model.busy()).toBe(false);
    expect(model.justPublished()).toBe(false);
  });

  it('should reload when the drafts change elsewhere, such as a restored backup', () => {
    const { model, layout, store } = setUp();
    store.documents.delete('drafts/home__hero');

    layout.changes$.next();

    expect(model.data()?.changes).toEqual([]);
  });

  it('should close a confirmation on cancel', () => {
    const { model } = setUp();
    model.askToPublish();

    model.cancel();

    expect(model.confirming()).toBe(false);
  });

  it('should tick the owner’s own changes, and publish only what is ticked', () => {
    const { model, store } = setUp({
      'drafts/home__shows': { ...heroDraft, path: 'home/shows', savedBy: 'manager' },
    });
    expect(model.selected()).toEqual(new Set(['home/hero']));

    model.toggle('home/hero', false);
    expect(model.canPublish()).toBe(false);
    model.toggle('home/shows', true);
    model.publish();

    expect(store.documents.has('drafts/home__hero')).toBe(true);
    expect(store.documents.has('drafts/home__shows')).toBe(false);
  });

  describe('for a manager (0019)', () => {
    const MANAGER = { uid: 'manager', email: 'm@b.co' };
    const seed = {
      'roles/manager': {
        email: MANAGER.email,
        pages: { offer: 'publish' },
        uploads: true,
        addedAt: 'x',
      },
      'drafts/home__hero': { ...heroDraft, savedBy: MANAGER.uid },
      'drafts/home__offer': {
        path: 'home/offer',
        content: fakeDb.home.offer,
        savedAt: 'x',
        savedBy: MANAGER.uid,
      },
    };

    it('should publish what they may, and send the rest for approval with their note', () => {
      const { model, show, store } = setUp(seed, MANAGER);
      expect(model.plan()).toEqual({ publish: ['home/offer'], send: ['home/hero'] });
      expect(model.buttonText()).toBe('Publish 1 change, send 1 change for approval');
      expect(model.isOwner()).toBe(false);

      model.note.setValue(' New title ');
      model.publish();

      expect(store.documents.has('drafts/home__offer')).toBe(false);
      const sent = [...store.documents].find(([path]) => path.startsWith('approvals/'));
      expect(sent?.[1]).toMatchObject({ paths: ['home/hero'], note: 'New title' });
      expect(store.documents.get('locks/home__hero')).toBeDefined();
      expect(show).toHaveBeenCalledWith(PUBLISH_MESSAGES.publishedAndSent);
      expect(model.note.value).toBe('');
      expect(model.data()?.changes).toEqual([]);
    });

    it('should only send, when nothing ticked may be published', () => {
      const { model, show } = setUp(seed, MANAGER);
      model.toggle('home/offer', false);
      expect(model.confirmButtonText()).toBe('Yes, send');

      model.publish();

      expect(show).toHaveBeenCalledWith(PUBLISH_MESSAGES.sent);
      expect(model.justPublished()).toBe(false);
    });

    it('should say “Yes, publish” when something ticked goes live', () => {
      const { model } = setUp(seed, MANAGER);

      expect(model.confirmButtonText()).toBe('Yes, publish');
      expect(model.confirmText()).toContain('Send 1 change to the owner for approval?');
    });
  });
});
