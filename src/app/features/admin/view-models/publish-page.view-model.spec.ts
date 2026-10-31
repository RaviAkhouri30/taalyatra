import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { PublishService } from '../services/publish.service';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
import { PUBLISH_MESSAGES, PublishPageViewModel } from './publish-page.view-model';

describe('PublishPageViewModel', () => {
  const heroDraft = {
    path: 'home/hero',
    content: { ...fakeDb.home.hero, title: 'New' },
    savedAt: '2026-10-31T09:00:00.000Z',
  };

  function setUp() {
    const testing = provideEditorTesting({
      'home/hero': fakeDb.home.hero,
      'drafts/home__hero': heroDraft,
    });
    const layout = layoutStub();
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        provideLayout(layout),
        { provide: ToastService, useValue: { show } },
        PublishPageViewModel,
      ],
    });
    const model = TestBed.inject(PublishPageViewModel);
    model.init().subscribe();
    return { model, layout, show, store: testing.store };
  }

  it('should load the drafts with their checks', () => {
    const { model } = setUp();

    expect(model.data()?.changes.map((change) => change.title)).toEqual(['Hero']);
    expect(model.data()?.report.canPublish).toBe(true);
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

  it('should restore an earlier version into the draft after confirmation', () => {
    const { model, show, store } = setUp();
    model.publish();
    const record = model.data()!.history[0]!.record;

    model.askToRestore(record);
    expect(model.restoring()).toBe(record.id);
    model.restore(record);

    expect(store.documents.get('drafts/home__hero')).toMatchObject({ content: fakeDb.home.hero });
    expect(show).toHaveBeenLastCalledWith(PUBLISH_MESSAGES.restored);
    expect(model.restoring()).toBeNull();
  });

  it('should close a confirmation on cancel', () => {
    const { model } = setUp();
    model.askToPublish();

    model.cancel();

    expect(model.confirming()).toBe(false);
  });
});
