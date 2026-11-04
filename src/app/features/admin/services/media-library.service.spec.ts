import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { MediaLibraryService } from './media-library.service';

describe('MediaLibraryService', () => {
  const now = new Date('2026-11-03T10:00:00.000Z');
  const media = {
    publicId: 'taal-yatra/media/abc',
    version: 123,
    width: 2400,
    height: 1800,
    bytes: 5000,
    format: 'jpg',
  };
  const entry = (uploadedAt: string): DocumentFields => ({
    ...media,
    name: 'photo.jpg',
    description: '',
    uploadedAt,
  });

  function setUp(seed: Readonly<Record<string, DocumentFields>> = {}) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(MediaLibraryService), store };
  }

  it('should list images newest first when several are stored', async () => {
    const { service } = setUp({
      'media/old': entry('2026-11-01T00:00:00.000Z'),
      'media/new': entry('2026-11-02T00:00:00.000Z'),
    });

    const assets = await firstValueFrom(service.assets());

    expect(assets.map((asset) => asset.dto.uploadedAt)).toEqual([
      '2026-11-02T00:00:00.000Z',
      '2026-11-01T00:00:00.000Z',
    ]);
  });

  it('should leave out a stored entry when it is not an image', async () => {
    const { service } = setUp({ 'media/bad': { name: 'no id' } });

    await expect(firstValueFrom(service.assets())).resolves.toEqual([]);
  });

  it('should store a new image under its own id, with no description yet', async () => {
    const { service, store } = setUp();

    const asset = await firstValueFrom(service.register(media, 'photo.jpg'));

    expect(asset.id).toBe('abc');
    expect(store.commits).toEqual([
      [
        {
          kind: DocumentWriteKind.Set,
          path: 'media/abc',
          fields: { ...entry(now.toISOString()) },
        },
      ],
    ]);
  });

  it('should find one image by its id', async () => {
    const { service } = setUp({ 'media/abc': entry('2026-11-01T00:00:00.000Z') });

    const asset = await firstValueFrom(service.asset('abc'));

    expect(asset?.id).toBe('abc');
  });

  it('should find nothing when the id is not in the library', async () => {
    await expect(firstValueFrom(setUp().service.asset('gone'))).resolves.toBeNull();
  });

  it('should tidy a description and keep the rest of the entry', async () => {
    const { service, store } = setUp();
    const asset = await firstValueFrom(service.register(media, 'photo.jpg'));

    const described = await firstValueFrom(service.describe(asset, '  A circle  '));

    expect(described.dto.description).toBe('A circle');
    expect(store.documents.get('media/abc')).toMatchObject({
      name: 'photo.jpg',
      description: 'A circle',
    });
  });

  it('should shorten a description to what the rules accept', async () => {
    const { service } = setUp();
    const asset = await firstValueFrom(service.register(media, 'photo.jpg'));

    const described = await firstValueFrom(service.describe(asset, 'x'.repeat(500)));

    expect(described.dto.description).toHaveLength(CONTENT_MAX_LENGTH.imageAlt);
  });

  it('should shorten a very long file name to what the rules accept', async () => {
    const { service } = setUp();

    const asset = await firstValueFrom(service.register(media, 'x'.repeat(500)));

    expect(asset.dto.name).toHaveLength(CONTENT_MAX_LENGTH.mediaName);
  });
});
