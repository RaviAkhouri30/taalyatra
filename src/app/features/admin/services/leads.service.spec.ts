import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { LeadStatus } from '../models/lead.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  const now = new Date('2026-11-18T05:00:00Z');
  const asha: DocumentFields = { name: 'Asha', phone: '1', createdAt: { seconds: 2 } };

  function setUp() {
    const store = new MemoryDocumentStore({
      'proposals/a': asha,
      'proposals/b': { name: 'Ravi', createdAt: { seconds: 1 } },
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return { service: TestBed.inject(LeadsService), store };
  }

  it('should read every lead, newest first', async () => {
    const { service } = setUp();

    const leads = await firstValueFrom(service.leads());

    expect(leads.map((lead) => lead.name)).toEqual(['Asha', 'Ravi']);
  });

  it('should save a status with its time and signer, keeping the rest exactly as read', async () => {
    const { service, store } = setUp();
    const [lead] = await firstValueFrom(service.leads());
    const changed = vi.fn();
    service.changed$.subscribe(changed);

    const saved = await firstValueFrom(service.setStatus(lead!, LeadStatus.Contacted, 'me@x.in'));

    expect(store.documents.get('proposals/a')).toEqual({
      ...asha,
      status: 'contacted',
      statusAt: now.toISOString(),
      statusBy: 'me@x.in',
    });
    expect(saved.status).toBe(LeadStatus.Contacted);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('should remove a lead for good', async () => {
    const { service, store } = setUp();
    const [lead] = await firstValueFrom(service.leads());
    const changed = vi.fn();
    service.changed$.subscribe(changed);

    await firstValueFrom(service.remove(lead!), { defaultValue: undefined });

    expect(store.documents.has('proposals/a')).toBe(false);
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
