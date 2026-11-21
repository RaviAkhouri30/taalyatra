import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, throwError } from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { AccountKind } from '../models/permissions.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { AccessService, SUPER_END_STEP_MS } from './access.service';

const OWNER = { uid: 'owner', email: 'o@b.c' };
const MANAGER = { uid: 'manager', email: 'm@b.c' };
const ROLE = { email: 'm@b.c', pages: {}, uploads: true, addedAt: '2026-11-19T10:00:00.000Z' };

describe('AccessService', () => {
  function setUp(user: IAuthUser | null, store = new MemoryDocumentStore()) {
    const user$ = new BehaviorSubject<IAuthUser | null>(user);
    TestBed.configureTestingModule({
      providers: [
        { provide: IAuthService, useValue: { user$ } },
        { provide: IDocumentStore, useValue: store },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, adminUid: OWNER.uid } },
      ],
    });
    const read = vi.spyOn(store, 'read');
    return { service: TestBed.inject(AccessService), user$, read, store };
  }

  it('should know the owner by id, without reading a role', async () => {
    const { service, read } = setUp(OWNER);

    await expect(firstValueFrom(service.permissions$)).resolves.toMatchObject({
      kind: AccountKind.Owner,
    });
    expect(read).not.toHaveBeenCalled();
  });

  it('should give a manager the permissions on their record, read once', async () => {
    const { service, read } = setUp(MANAGER, new MemoryDocumentStore({ 'roles/manager': ROLE }));

    await firstValueFrom(service.permissions$);
    const permissions = await firstValueFrom(service.permissions$);

    expect(permissions.kind).toBe(AccountKind.Manager);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['has no record', new MemoryDocumentStore()],
    ['has a damaged record', new MemoryDocumentStore({ 'roles/manager': { pages: {} } })],
  ])('should give no access to an account that %s', async (_case, store) => {
    const { service } = setUp(MANAGER, store);

    await expect(firstValueFrom(service.permissions$)).resolves.toMatchObject({
      kind: AccountKind.None,
    });
  });

  it('should give no access when the rules refuse the read', async () => {
    const store = new MemoryDocumentStore();
    vi.spyOn(store, 'read').mockReturnValue(throwError(() => new Error('denied')));
    const { service } = setUp(MANAGER, store);

    await expect(firstValueFrom(service.permissions$)).resolves.toMatchObject({
      kind: AccountKind.None,
    });
  });

  it('should read the role afresh after signing out and in again', async () => {
    const { service, user$, read } = setUp(
      MANAGER,
      new MemoryDocumentStore({ 'roles/manager': ROLE }),
    );
    await firstValueFrom(service.permissions$);

    user$.next(null);
    await expect(firstValueFrom(service.permissions$)).resolves.toMatchObject({ uid: '' });
    user$.next(MANAGER);
    await firstValueFrom(service.permissions$);

    expect(read).toHaveBeenCalledTimes(2);
  });

  describe('a super manager’s end (0024)', () => {
    const NOW = Date.parse('2026-11-21T10:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers({ now: NOW });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function superUntil(untilMs: number | null) {
      const role = { ...ROLE, superManager: { since: 'x', untilMs } };
      const { service } = setUp(MANAGER, new MemoryDocumentStore({ 'roles/manager': role }));
      const seen: boolean[] = [];
      service.permissions$.subscribe((permissions) => {
        seen.push(permissions.isSuper);
      });
      return seen;
    }

    it('should drop the super manager at the end, without a reload', async () => {
      const seen = superUntil(NOW + 60_000);
      await vi.advanceTimersByTimeAsync(0);

      expect(seen).toEqual([true]);
      await vi.advanceTimersByTimeAsync(60_000);

      expect(seen).toEqual([true, false]);
    });

    it('should reach a far end in steps no longer than a day', async () => {
      const seen = superUntil(NOW + 40 * SUPER_END_STEP_MS);
      await vi.advanceTimersByTimeAsync(39 * SUPER_END_STEP_MS);

      expect(seen).toEqual([true]);
      await vi.advanceTimersByTimeAsync(SUPER_END_STEP_MS);

      expect(seen).toEqual([true, false]);
    });

    it('should not wait for a super manager for good', async () => {
      const seen = superUntil(null);
      await vi.advanceTimersByTimeAsync(SUPER_END_STEP_MS);

      expect(seen).toEqual([true]);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
