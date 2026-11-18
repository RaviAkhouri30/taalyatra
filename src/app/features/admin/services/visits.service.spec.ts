import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { VisitsService } from './visits.service';

describe('VisitsService', () => {
  /** 18 Nov 2026, 3:30 pm in Pune. */
  const now = new Date('2026-11-18T10:00:00Z');
  const visit = (day: string): DocumentFields => ({
    page: '/',
    device: 'phone',
    createdAt: { seconds: Date.parse(`${day}T06:30:00Z`) / 1000 },
  });

  function setUp(seed: Readonly<Record<string, DocumentFields>>) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(VisitsService), store };
  }

  it('should add yesterday up into one document and remove its single visits', async () => {
    const { service, store } = setUp({
      'visits/a': visit('2026-11-17'),
      'visits/b': visit('2026-11-17'),
      'visits/c': visit('2026-11-18'),
    });

    const history = await firstValueFrom(service.load());

    expect(store.documents.get('visitDays/2026-11-17')).toEqual({
      total: 2,
      pages: { '/': 2 },
      devices: { phone: 2 },
    });
    expect([...store.documents.keys()].filter((path) => path.startsWith('visits/'))).toEqual([
      'visits/c',
    ]);
    expect(history).toEqual({
      today: '2026-11-18',
      days: [
        expect.objectContaining({ day: '2026-11-17', total: 2 }),
        expect.objectContaining({ day: '2026-11-18', total: 1 }),
      ],
    });
  });

  it('should write nothing when only today has visits', async () => {
    const { service, store } = setUp({ 'visits/c': visit('2026-11-18') });

    await firstValueFrom(service.load());

    expect(store.commits).toEqual([]);
  });

  it('should split a busy day into commits Firestore accepts, the day first', async () => {
    const seed = Object.fromEntries(
      Array.from({ length: 600 }, (_, index) => [`visits/${String(index)}`, visit('2026-11-17')]),
    );
    const { service, store } = setUp(seed);

    await firstValueFrom(service.load());

    expect(store.commits.map((commit) => commit.length)).toEqual([500, 101]);
    expect(store.commits[0]?.[0]?.path).toBe('visitDays/2026-11-17');
  });

  it('should keep a day’s single visits when its document is refused, and still answer', async () => {
    const { service, store } = setUp({ 'visits/a': visit('2026-11-17') });
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('denied')));

    const history = await firstValueFrom(service.load());

    expect(store.documents.has('visits/a')).toBe(true);
    expect(history.days[0]?.total).toBe(1);
  });

  it('should go on to the next day when one day fails', async () => {
    const { service, store } = setUp({
      'visits/a': visit('2026-11-16'),
      'visits/b': visit('2026-11-17'),
    });
    const commit = store.commit.bind(store);
    vi.spyOn(store, 'commit')
      .mockReturnValueOnce(throwError(() => new Error('denied')))
      .mockImplementation(commit);

    await firstValueFrom(service.load());

    expect(store.documents.has('visitDays/2026-11-17')).toBe(true);
    expect(store.documents.has('visits/a')).toBe(true);
  });

  it('should fail when the visits can’t be read', async () => {
    const { service, store } = setUp({});
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    await expect(firstValueFrom(service.load())).rejects.toThrow('offline');
  });
});
