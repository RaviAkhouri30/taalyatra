import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { MediaAsset } from '../models/media-asset.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { MediaUsageService } from './media-usage.service';

describe('MediaUsageService', () => {
  const image = (id: string) => ({
    src: `v1/taal-yatra/media/${id}`,
    alt: 'A circle',
    width: 1,
    height: 1,
  });
  const asset = (id: string) =>
    new MediaAsset({
      publicId: `taal-yatra/media/${id}`,
      version: 2,
      width: 100,
      height: 50,
      bytes: 1,
      format: 'jpg',
      name: `${id}.jpg`,
      description: '',
      uploadedAt: 'x',
    });

  function setUp(seed: ConstructorParameters<typeof MemoryDocumentStore>[0]) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-04T00:00:00Z') } },
      ],
    });
    return { service: TestBed.inject(MediaUsageService), store };
  }

  describe('usages', () => {
    it('should find a use in a published collection', async () => {
      const { service } = setUp({ 'gallery/001': { ...image('abc'), order: 0 } });

      const uses = await firstValueFrom(service.usages());

      expect(uses.get('abc')).toEqual(['Photos · Photo 1']);
    });

    it('should find a use that exists only in a draft', async () => {
      const { service } = setUp({
        'drafts/gallery': {
          path: 'gallery',
          content: { _items: [image('abc')] },
          savedAt: 'x',
        },
      });

      const uses = await firstValueFrom(service.usages());

      expect(uses.get('abc')).toEqual(['Photos · Photo 1']);
    });

    it('should list a place once when both versions use it', async () => {
      const { service } = setUp({
        'gallery/001': { ...image('abc'), order: 0 },
        'drafts/gallery': { path: 'gallery', content: { _items: [image('abc')] }, savedAt: 'x' },
      });

      const uses = await firstValueFrom(service.usages());

      expect(uses.get('abc')).toHaveLength(1);
    });

    it('should find nothing for an unused image', async () => {
      const uses = await firstValueFrom(setUp({}).service.usages());

      expect(uses.has('abc')).toBe(false);
    });
  });

  describe('replace', () => {
    it('should rewrite each use into a draft, leaving the published version alone', async () => {
      const { service, store } = setUp({ 'gallery/001': { ...image('old'), order: 0 } });

      const changed = await firstValueFrom(service.replace(asset('old'), asset('new')));

      expect(changed).toBe(1);
      expect(store.documents.get('drafts/gallery')).toMatchObject({
        content: { _items: [{ src: 'v2/taal-yatra/media/new', alt: 'A circle', width: 100 }] },
      });
      expect(store.documents.get('gallery/001')).toMatchObject({ src: image('old').src });
    });

    it('should build on an existing draft rather than the published version', async () => {
      const draftItems = [{ src: '/kept.webp', alt: 'Kept', width: 1, height: 1 }, image('old')];
      const { service, store } = setUp({
        'gallery/001': { ...image('old'), order: 0 },
        'drafts/gallery': { path: 'gallery', content: { _items: draftItems }, savedAt: 'x' },
      });

      await firstValueFrom(service.replace(asset('old'), asset('new')));

      expect(store.documents.get('drafts/gallery')).toMatchObject({
        content: { _items: [{ src: '/kept.webp' }, { src: 'v2/taal-yatra/media/new' }] },
      });
    });

    it('should change nothing when the image is not used', async () => {
      const { service, store } = setUp({});

      await expect(firstValueFrom(service.replace(asset('old'), asset('new')))).resolves.toBe(0);

      expect(store.commits).toEqual([]);
    });
  });
});
