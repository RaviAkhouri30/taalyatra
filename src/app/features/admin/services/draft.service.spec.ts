import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { DraftService } from './draft.service';

describe('DraftService', () => {
  const now = new Date('2026-10-31T10:00:00Z');

  function setUp(seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = {}) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(DraftService), store };
  }

  it('should save a whole document as a draft next to the live one', async () => {
    const { service, store } = setUp();

    const draft = await firstValueFrom(service.save('home/hero', { title: 'New' }));

    expect(draft).toEqual({
      path: 'home/hero',
      content: { title: 'New' },
      savedAt: '2026-10-31T10:00:00.000Z',
    });
    expect(store.documents.get('drafts/home__hero')).toEqual(draft);
  });

  it('should show the draft of a document when there is one, else the live document', async () => {
    const { service } = setUp({
      'home/hero': { title: 'Live' },
      'home/offer': { title: 'Live offer' },
      'drafts/home__hero': { path: 'home/hero', content: { title: 'Draft' }, savedAt: 'x' },
    });

    await expect(firstValueFrom(service.document('home/hero'))).resolves.toEqual({
      title: 'Draft',
    });
    await expect(firstValueFrom(service.document('home/offer'))).resolves.toEqual({
      title: 'Live offer',
    });
    await expect(firstValueFrom(service.document('site/visibility'))).resolves.toBeNull();
  });

  it('should list drafts by document path, ignoring damaged ones', async () => {
    const { service } = setUp({
      'drafts/home__hero': { path: 'home/hero', content: { title: 'A' }, savedAt: 'x' },
      'drafts/broken': { path: 'home/offer', content: 'not a document', savedAt: 'x' },
    });

    const drafts = await firstValueFrom(service.drafts());

    expect([...drafts.keys()]).toEqual(['home/hero']);
  });

  it('should save several drafts in one commit', async () => {
    const { service, store } = setUp();

    await firstValueFrom(
      service.saveAll(
        new Map([
          ['home/hero', { title: 'A' }],
          ['site/config', { copyrightYear: 2026 }],
        ]),
      ),
      { defaultValue: undefined },
    );

    expect(store.commits).toHaveLength(1);
    expect([...store.documents.keys()].sort((a, b) => a.localeCompare(b))).toEqual([
      'drafts/home__hero',
      'drafts/site__config',
    ]);
  });

  it('should throw drafts away together', async () => {
    const { service, store } = setUp({
      'drafts/home__hero': { path: 'home/hero', content: {}, savedAt: 'x' },
      'drafts/home__offer': { path: 'home/offer', content: {}, savedAt: 'x' },
    });

    await firstValueFrom(service.discard(['home/hero', 'home/offer']), { defaultValue: undefined });

    expect(store.documents.size).toBe(0);
    expect(store.commits).toHaveLength(1);
  });
});
