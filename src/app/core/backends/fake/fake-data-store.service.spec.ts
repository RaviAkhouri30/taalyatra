import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { LocalStoreService } from '@core/services/local-store.service';
import { FAKE_OVERLAY_STORAGE_KEY, FakeDataStore } from './fake-data-store.service';

describe('FakeDataStore', () => {
  /** Stands in for the browser's storage; it outlives each TestBed, like a real reload. */
  let saved: Map<string, string>;

  function create(): FakeDataStore {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStoreService,
          useValue: {
            get: (key: string) => saved.get(key) ?? null,
            set: (key: string, value: string) => saved.set(key, value),
          },
        },
      ],
    });
    return TestBed.inject(FakeDataStore);
  }

  beforeEach(() => {
    saved = new Map();
  });

  it('should read a stored document from the fake database by path', async () => {
    const hero = await firstValueFrom(create().read('/home/hero/'));

    expect(hero).toHaveProperty('title');
  });

  it('should answer undefined for a missing path', async () => {
    await expect(firstValueFrom(create().read('home/missing/deeper'))).resolves.toBeUndefined();
  });

  it('should read written documents first and forget deleted ones', async () => {
    const store = create();

    store.apply([
      { kind: DocumentWriteKind.Set, path: 'home/hero', fields: { title: 'Edited' } },
      { kind: DocumentWriteKind.Delete, path: 'home/faq' },
    ]);

    await expect(firstValueFrom(store.read('home/hero'))).resolves.toEqual({ title: 'Edited' });
    await expect(firstValueFrom(store.read('home/faq'))).resolves.toBeUndefined();
  });

  it('should list a collection with written documents in and deleted ones out', async () => {
    const store = create();
    store.apply([
      { kind: DocumentWriteKind.Set, path: 'drafts/home__hero', fields: { path: 'home/hero' } },
      { kind: DocumentWriteKind.Set, path: 'drafts/site__config', fields: { path: 'site/config' } },
      { kind: DocumentWriteKind.Delete, path: 'drafts/site__config' },
      { kind: DocumentWriteKind.Set, path: 'drafts/home__hero/history/1', fields: {} },
    ]);

    const drafts = await firstValueFrom(store.children('drafts'));

    expect([...drafts.keys()]).toEqual(['home__hero']);
  });

  it('should list a stored collection of documents', async () => {
    const site = await firstValueFrom(create().children('site'));

    expect(site.has('config')).toBe(true);
  });

  it('should keep written documents for the next visit', async () => {
    create().apply([{ kind: DocumentWriteKind.Set, path: 'home/hero', fields: { title: 'Kept' } }]);
    TestBed.resetTestingModule();

    await expect(firstValueFrom(create().read('home/hero'))).resolves.toEqual({ title: 'Kept' });
  });

  it('should start from the fake database when saved data is unreadable', async () => {
    saved.set(FAKE_OVERLAY_STORAGE_KEY, '{not json');

    const hero = await firstValueFrom(create().read('home/hero'));

    expect(hero).toHaveProperty('title');
  });

  it('should ignore saved data that is not a list of entries', async () => {
    saved.set(FAKE_OVERLAY_STORAGE_KEY, '{"home/hero":{}}');

    const hero = await firstValueFrom(create().read('home/hero'));

    expect(hero).toHaveProperty('title');
  });

  describe('collections', () => {
    const write = (path: string, fields: object) => ({
      kind: DocumentWriteKind.Set as const,
      path,
      fields: { ...fields },
    });

    it('should list a collection as numbered documents with their order', async () => {
      const documents = await firstValueFrom(create().children('gallery'));

      expect([...documents.keys()].slice(0, 2)).toEqual(['001', '002']);
      expect(documents.get('002')).toMatchObject({ order: 1 });
    });

    it('should answer a collection read as the plain list when nothing was written', async () => {
      const store = create();

      const list = await firstValueFrom(store.read('gallery'));

      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength((await firstValueFrom(store.children('gallery'))).size);
    });

    it('should answer in the new order, without it, after a publish rewrites the list', async () => {
      const store = create();
      store.apply([
        write('gallery/001', { src: '/b.webp', order: 1 }),
        write('gallery/002', { src: '/a.webp', order: 0 }),
      ]);

      const list = (await firstValueFrom(store.read('gallery'))) as object[];

      expect(list.slice(0, 2)).toEqual([{ src: '/a.webp' }, { src: '/b.webp' }]);
    });

    it('should drop a deleted item from the list', async () => {
      const store = create();
      const before = ((await firstValueFrom(store.read('gallery'))) as object[]).length;

      store.apply([{ kind: DocumentWriteKind.Delete, path: 'gallery/001' }]);

      await expect(firstValueFrom(store.read('gallery'))).resolves.toHaveLength(before - 1);
    });
  });
});
