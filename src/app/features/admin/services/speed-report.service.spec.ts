import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { SpeedReportService } from './speed-report.service';

describe('SpeedReportService', () => {
  const now = new Date('2026-11-05T00:00:00Z');
  const report = (daysOld: number): DocumentFields => ({
    device: 'phone',
    lcp: 1000,
    createdAt: { seconds: now.getTime() / 1000 - daysOld * 86_400 },
  });

  function setUp(seed: Readonly<Record<string, DocumentFields>>) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(SpeedReportService), store };
  }

  it('should count recent reports and remove old ones', async () => {
    const { service, store } = setUp({ 'vitals/new': report(1), 'vitals/old': report(40) });

    const result = await firstValueFrom(service.load());

    expect(result.rows[0]?.visits).toBe(1);
    expect(store.documents.has('vitals/old')).toBe(false);
    expect(store.documents.has('vitals/new')).toBe(true);
  });

  it('should write nothing when nothing is old', async () => {
    const { service, store } = setUp({ 'vitals/new': report(1) });

    await firstValueFrom(service.load());

    expect(store.commits).toEqual([]);
  });

  it('should split a long cleanup into commits Firestore accepts', async () => {
    const seed = Object.fromEntries(
      Array.from({ length: 501 }, (_, index) => [`vitals/${String(index)}`, report(40)]),
    );
    const { service, store } = setUp(seed);

    await firstValueFrom(service.load());

    expect(store.commits.map((commit) => commit.length)).toEqual([500, 1]);
    expect(store.documents.size).toBe(0);
  });

  it('should still answer when the cleanup fails', async () => {
    const { service, store } = setUp({ 'vitals/new': report(1), 'vitals/old': report(40) });
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('denied')));

    const result = await firstValueFrom(service.load());

    expect(result.rows[0]?.visits).toBe(1);
  });
});
