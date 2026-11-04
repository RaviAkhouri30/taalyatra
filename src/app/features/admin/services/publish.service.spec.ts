import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { type IDraft } from '@core/interfaces/i-draft';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { PublishService } from './publish.service';

describe('PublishService', () => {
  const now = new Date('2026-10-31T10:00:00.000Z');
  const heroDraft: IDraft = { path: 'home/hero', content: { title: 'New' }, savedAt: 'x' };

  function setUp(seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = {}) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(PublishService), store };
  }

  it('should publish drafts, record what they replaced and remove them, in one commit', async () => {
    const { service, store } = setUp({
      'home/hero': { title: 'Old' },
      'drafts/home__hero': { ...heroDraft },
    });

    const record = await firstValueFrom(service.publish(new Map([['home/hero', heroDraft]])));

    expect(store.commits).toHaveLength(1);
    expect(store.documents.get('home/hero')).toEqual({ title: 'New' });
    expect(store.documents.has('drafts/home__hero')).toBe(false);
    expect(record).toEqual({
      id: '2026-10-31T10-00-00-000Z',
      publishedAt: '2026-10-31T10:00:00.000Z',
      changed: ['home/hero'],
      before: { 'home/hero': { title: 'Old' } },
    });
    expect(store.documents.get('publishes/2026-10-31T10-00-00-000Z')).toEqual({
      publishedAt: record?.publishedAt,
      changed: record?.changed,
      before: record?.before,
    });
  });

  it('should record a document that did not exist before as null', async () => {
    const { service } = setUp();
    const draft: IDraft = { path: 'site/visibility', content: { sections: {} }, savedAt: 'x' };

    const record = await firstValueFrom(service.publish(new Map([[draft.path, draft]])));

    expect(record?.before).toEqual({ 'site/visibility': null });
  });

  it('should do nothing when there are no drafts', async () => {
    const { service, store } = setUp();

    await expect(firstValueFrom(service.publish(new Map()))).resolves.toBeNull();
    expect(store.commits).toHaveLength(0);
  });

  it('should keep the history at its limit, dropping the oldest records', async () => {
    const seed = Object.fromEntries(
      Array.from({ length: 20 }, (_, day) => [
        `publishes/2026-10-${String(day + 1).padStart(2, '0')}T00-00-00-000Z`,
        { publishedAt: 'x', changed: [], before: {} },
      ]),
    );
    const { service, store } = setUp(seed);

    await firstValueFrom(service.publish(new Map([['home/hero', heroDraft]])));
    const history = await firstValueFrom(service.history());

    expect(history).toHaveLength(20);
    expect(history[0]?.id).toBe('2026-10-31T10-00-00-000Z');
    expect(store.documents.has('publishes/2026-10-01T00-00-00-000Z')).toBe(false);
  });

  it('should list the history newest first, ignoring damaged records', async () => {
    const { service } = setUp({
      'publishes/2026-10-01T00-00-00-000Z': {
        publishedAt: 'a',
        changed: ['home/hero', 7],
        before: {},
      },
      'publishes/2026-10-02T00-00-00-000Z': { publishedAt: 'b', changed: [], before: {} },
      'publishes/broken': { publishedAt: 3 },
    });

    const history = await firstValueFrom(service.history());

    expect(history.map((record) => record.id)).toEqual([
      '2026-10-02T00-00-00-000Z',
      '2026-10-01T00-00-00-000Z',
    ]);
    expect(history[1]?.changed).toEqual(['home/hero']);
  });

  it('should put the versions from before a publish back into drafts', async () => {
    const { service, store } = setUp();

    await firstValueFrom(
      service.restore({
        id: 'r',
        publishedAt: 'x',
        changed: ['home/hero', 'site/visibility'],
        before: { 'home/hero': { title: 'Old' }, 'site/visibility': null },
      }),
      { defaultValue: undefined },
    );

    expect(store.documents.get('drafts/home__hero')).toMatchObject({
      path: 'home/hero',
      content: { title: 'Old' },
    });
    expect(store.documents.has('drafts/site__visibility')).toBe(false);
  });

  describe('collections', () => {
    const seed = {
      'videos/001': { title: 'A', order: 0 },
      'videos/002': { title: 'B', order: 1 },
      'videos/003': { title: 'C', order: 2 },
    };
    const draft = (items: readonly object[]): IDraft => ({
      path: 'videos',
      content: { _items: items },
      savedAt: 'x',
    });

    it('should expand a draft into numbered documents and delete unused numbers, together', async () => {
      const { service, store } = setUp({ ...seed, 'drafts/videos': { ...draft([]) } });

      await firstValueFrom(
        service.publish(new Map([['videos', draft([{ title: 'B' }, { title: 'A' }])]])),
      );

      expect(store.commits).toHaveLength(1);
      expect(store.documents.get('videos/001')).toEqual({ title: 'B', order: 0 });
      expect(store.documents.get('videos/002')).toEqual({ title: 'A', order: 1 });
      expect(store.documents.has('videos/003')).toBe(false);
      expect(store.documents.has('videos')).toBe(false);
      expect(store.documents.has('drafts/videos')).toBe(false);
    });

    it('should grow the collection when the list has new items', async () => {
      const { service, store } = setUp(seed);
      const items = ['A', 'B', 'C', 'D'].map((title) => ({ title }));

      await firstValueFrom(service.publish(new Map([['videos', draft(items)]])));

      expect(store.documents.get('videos/004')).toEqual({ title: 'D', order: 3 });
    });

    it('should keep the list as it was, for undo', async () => {
      const { service } = setUp(seed);

      const record = await firstValueFrom(service.publish(new Map([['videos', draft([])]])));

      expect(record?.before['videos']).toEqual({
        _items: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
      });
    });

    it('should put the whole list back into a draft when a publish is undone', async () => {
      const { service, store } = setUp(seed);
      const record = await firstValueFrom(service.publish(new Map([['videos', draft([])]])));

      await firstValueFrom(service.restore(record!));

      expect(store.documents.get('drafts/videos')).toMatchObject({
        path: 'videos',
        content: { _items: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      });
    });
  });
});
