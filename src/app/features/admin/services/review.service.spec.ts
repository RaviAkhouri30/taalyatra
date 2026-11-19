import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { DraftAction } from '../models/permissions.model';
import { A_MANAGER } from '../models/review.model';
import { EDITOR_ADMIN, provideSignedIn } from '../testing/editor-testing';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { ApprovalService } from './approval.service';
import { RolesService } from './roles.service';
import { ReviewService } from './review.service';

const MANAGER = { uid: 'manager', email: 'm@b.co' };
const ROLE = {
  email: MANAGER.email,
  pages: { offer: 'publish' },
  uploads: true,
  addedAt: '2026-11-19T09:00:00.000Z',
};
const draft = (path: string, savedBy: string, content: Record<string, unknown> = {}) => ({
  path,
  content,
  savedAt: '2026-11-19T10:00:00.000Z',
  savedBy,
});

describe('ReviewService', () => {
  function setUp(user = EDITOR_ADMIN, seed: Record<string, Record<string, unknown>> = {}) {
    const store = new MemoryDocumentStore({
      'roles/manager': ROLE,
      'drafts/home__hero': draft('home/hero', MANAGER.uid),
      ...seed,
    });
    TestBed.configureTestingModule({
      providers: [{ provide: IDocumentStore, useValue: store }, ...provideSignedIn(user)],
    });
    return { service: TestBed.inject(ReviewService), store };
  }

  it('should name managers by email for the owner', async () => {
    const { service } = setUp();

    const review = await firstValueFrom(service.review());

    expect(review.changes[0]?.author).toBe(MANAGER.email);
  });

  it('should still review when the managers or requests can’t be read', async () => {
    const { service } = setUp();
    vi.spyOn(TestBed.inject(RolesService), 'managers').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    vi.spyOn(TestBed.inject(ApprovalService), 'requests').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    const review = await firstValueFrom(service.review());

    expect(review.changes[0]?.author).toBe(A_MANAGER);
    expect(review.requests).toEqual([]);
  });

  it('should compare a manager’s shared draft with what’s live, part by part', async () => {
    const { service } = setUp(MANAGER, {
      'site/config': { promotion: { on: false }, brand: { name: 'Taal Yatra' } },
      'drafts/site__config': draft('site/config', MANAGER.uid, {
        promotion: { on: true },
        brand: { name: 'Taal Yatra' },
      }),
      'drafts/site__other': draft('site/other', MANAGER.uid),
    });

    const review = await firstValueFrom(service.review());

    expect(review.changes.find((change) => change.path === 'site/config')?.action).toBe(
      DraftAction.Publish,
    );
    expect(review.mine()).toContain('site/config');
  });

  it('should read nothing live when a manager has no drafts they can see', async () => {
    const { service, store } = setUp(MANAGER, {});
    store.documents.delete('drafts/home__hero');
    const read = vi.spyOn(store, 'read');

    const review = await firstValueFrom(service.review());

    expect(review.changes).toEqual([]);
    expect(read).toHaveBeenCalledTimes(1);
  });
});
