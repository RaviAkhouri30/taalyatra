import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { ApprovalStatus, type IApproval } from '../models/approval.model';
import { provideSignedIn } from '../testing/editor-testing';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { ApprovalService } from './approval.service';

const NOW = new Date('2026-11-19T10:00:00.000Z');
const MANAGER = { uid: 'manager', email: 'm@b.c' };
const ROLE = { email: 'm@b.c', pages: {}, uploads: true, addedAt: '2026-11-19T09:00:00.000Z' };

const WAITING: IApproval = {
  id: 'r1',
  by: 'manager',
  email: 'm@b.c',
  paths: ['home/offer'],
  note: 'New dates',
  sentAt: '2026-11-19T09:30:00.000Z',
  status: ApprovalStatus.Waiting,
  answer: '',
  answeredAt: '',
};

describe('ApprovalService', () => {
  function setUp(seed: Record<string, Record<string, unknown>> = {}, user = MANAGER) {
    const store = new MemoryDocumentStore({ 'roles/manager': ROLE, ...seed });
    TestBed.configureTestingModule({
      providers: [
        { provide: IDocumentStore, useValue: store },
        ...provideSignedIn(user),
        { provide: CLOCK, useValue: { now: () => NOW } },
      ],
    });
    const service = TestBed.inject(ApprovalService);
    const changed = vi.fn();
    service.changed$.subscribe(changed);
    return { service, store, changed };
  }

  it('should send drafts with a note, locking each one, in one commit', async () => {
    const { service, store, changed } = setUp();

    await firstValueFrom(service.send(['home/offer', 'site/config'], '  New dates '));

    const id = '2026-11-19T10-00-00-000Z-manager';
    expect(store.commits).toHaveLength(1);
    expect(store.documents.get(`approvals/${id}`)).toEqual({
      by: 'manager',
      email: 'm@b.c',
      paths: ['home/offer', 'site/config'],
      note: 'New dates',
      sentAt: NOW.toISOString(),
      status: 'waiting',
    });
    expect(store.documents.get('locks/home__offer')).toEqual({ approval: id });
    expect(store.documents.get('locks/site__config')).toEqual({ approval: id });
    expect(changed).toHaveBeenCalled();
  });

  it('should list requests newest first, ignoring damaged ones', async () => {
    const { service } = setUp({
      'approvals/old': { ...WAITING, sentAt: '2026-11-18T10:00:00.000Z' },
      'approvals/new': { ...WAITING },
      'approvals/bad': { status: 'waiting' },
    });

    const requests = await firstValueFrom(service.requests());

    expect(requests.map((request) => request.id)).toEqual(['new', 'old']);
  });

  it('should withdraw a request together with its locks', async () => {
    const { service, store } = setUp({
      'approvals/r1': { ...WAITING },
      'locks/home__offer': { approval: 'r1' },
    });

    await firstValueFrom(service.withdraw(WAITING));

    expect(store.documents.has('approvals/r1')).toBe(false);
    expect(store.documents.has('locks/home__offer')).toBe(false);
  });

  it('should dismiss an answered request without touching locks', async () => {
    const { service, store } = setUp({ 'approvals/r1': { ...WAITING, status: 'approved' } });

    await firstValueFrom(service.dismiss({ ...WAITING, status: ApprovalStatus.Approved }));

    expect(store.commits.at(-1)).toEqual([{ kind: 'delete', path: 'approvals/r1' }]);
  });

  it('should send a request back with a reason, unlocking its drafts', async () => {
    const { service, store } = setUp({ 'locks/home__offer': { approval: 'r1' } });

    await firstValueFrom(service.sendBack(WAITING, ' Dates are wrong '));

    expect(store.documents.get('approvals/r1')).toMatchObject({
      status: 'sent-back',
      answer: 'Dates are wrong',
      answeredAt: NOW.toISOString(),
      note: 'New dates',
    });
    expect(store.documents.has('locks/home__offer')).toBe(false);
  });

  it('should publish only the request’s drafts, mark it approved and unlock it, together', async () => {
    const owner = { uid: 'admin-uid', email: 'owner@example.com' };
    const draft = (path: string) => ({ path, content: { title: path }, savedAt: 'x' });
    const { service, store } = setUp(
      {
        'home/offer': { title: 'Old' },
        'drafts/home__offer': draft('home/offer'),
        'drafts/home__hero': draft('home/hero'),
        'locks/home__offer': { approval: 'r1' },
      },
      owner,
    );
    const drafts = new Map([
      ['home/offer', draft('home/offer')],
      ['home/hero', draft('home/hero')],
    ]);

    await firstValueFrom(service.approve(WAITING, drafts));

    expect(store.commits).toHaveLength(1);
    expect(store.documents.get('home/offer')).toEqual({ title: 'home/offer' });
    expect(store.documents.has('drafts/home__hero')).toBe(true);
    expect(store.documents.get('approvals/r1')).toMatchObject({ status: 'approved' });
    expect(store.documents.has('locks/home__offer')).toBe(false);
    expect(store.documents.get('publishes/2026-11-19T10-00-00-000Z')).toMatchObject({
      by: 'admin-uid',
      approvedFrom: 'm@b.c',
    });
  });

  it('should tell an editor page what waits on it, locked for the manager', async () => {
    const { service } = setUp({ 'approvals/r1': { ...WAITING } });

    const notice = await firstValueFrom(service.notice(['home/offer']));

    expect(notice).toMatchObject({ locked: true, note: 'New dates' });
    await expect(firstValueFrom(service.notice(['home/hero']))).resolves.toBeNull();
  });

  it('should lock nothing when the requests can’t be read', async () => {
    const { service, store } = setUp();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('denied')));

    await expect(firstValueFrom(service.notice(['home/offer']))).resolves.toBeNull();
  });
});
