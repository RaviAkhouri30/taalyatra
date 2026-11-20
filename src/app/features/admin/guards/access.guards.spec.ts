import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  type CanActivateFn,
  Router,
  type UrlTree,
  provideRouter,
} from '@angular/router';
import { type Observable, firstValueFrom, of, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { EDITOR_TAB_ROUTE_KEY } from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { Permissions } from '../models/permissions.model';
import { PageAccess } from '../models/role.model';
import { AccessService } from '../services/access.service';
import { editorGuard } from './editor.guard';
import { editorTabGuard } from './editor-tab.guard';
import { areaGuard } from './area.guard';
import { ownerGuard } from './owner.guard';
import { ManagerArea } from '../models/manager-area.enum';
import { signedOutGuard } from './signed-out.guard';

const OWNER = Permissions.owner({ uid: 'owner', email: 'o@b.c' });
const MANAGER = Permissions.manager(
  { uid: 'manager', email: 'm@b.c' },
  {
    email: 'm@b.c',
    pages: new Map([[EditorTab.Team, PageAccess.Hidden]]),
    uploads: true,
    addedAt: '2026-11-19T10:00:00.000Z',
  },
);
const STRANGER = Permissions.none({ uid: 'someone', email: 's@b.c' });
const SIGNED_OUT = Permissions.none();

describe('admin guards', () => {
  function run(
    guard: CanActivateFn,
    permissions: Permissions,
    options: { signOut?: () => Observable<void>; tab?: EditorTab } = {},
  ): { result: Promise<boolean | string>; signOut: ReturnType<typeof vi.fn> } {
    const signOut = vi.fn(options.signOut ?? (() => of(undefined)));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IAuthService, useValue: { user$: of(null), signOut } },
        { provide: AccessService, useValue: { permissions$: of(permissions) } },
      ],
    });
    const route = {
      data: { [EDITOR_TAB_ROUTE_KEY]: options.tab },
    } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => guard(route, {} as never)) as Observable<
      boolean | UrlTree
    >;
    const serialize = (value: boolean | UrlTree): boolean | string =>
      typeof value === 'boolean' ? value : TestBed.inject(Router).serializeUrl(value);
    return { result: firstValueFrom(result).then(serialize), signOut };
  }

  describe('editorGuard', () => {
    it('should send a signed-out visitor to the sign-in page', async () => {
      await expect(run(editorGuard, SIGNED_OUT).result).resolves.toBe('/admin/sign-in');
    });

    it.each([
      ['the owner', OWNER],
      ['a manager', MANAGER],
    ])('should let %s in', async (_case, permissions) => {
      await expect(run(editorGuard, permissions).result).resolves.toBe(true);
    });

    it('should sign out an account never added, and explain why', async () => {
      const { result, signOut } = run(editorGuard, STRANGER);

      await expect(result).resolves.toBe('/admin/sign-in?reason=not-admin');
      expect(signOut).toHaveBeenCalled();
    });

    it('should still turn the account away when signing out fails', async () => {
      const { result } = run(editorGuard, STRANGER, {
        signOut: () => throwError(() => new Error('offline')),
      });

      await expect(result).resolves.toBe('/admin/sign-in?reason=not-admin');
    });
  });

  describe('ownerGuard', () => {
    it('should let the owner in', async () => {
      await expect(run(ownerGuard, OWNER).result).resolves.toBe(true);
    });

    it('should send a manager to the dashboard', async () => {
      await expect(run(ownerGuard, MANAGER).result).resolves.toBe('/admin');
    });
  });

  describe('areaGuard', () => {
    const leadsManager = Permissions.manager(
      { uid: 'manager', email: 'm@b.c' },
      {
        email: 'm@b.c',
        pages: new Map(),
        uploads: true,
        addedAt: '2026-11-19T10:00:00.000Z',
        areas: new Set([ManagerArea.Leads]),
      },
    );

    it('should let the owner in', async () => {
      await expect(run(areaGuard(ManagerArea.Visits), OWNER).result).resolves.toBe(true);
    });

    it('should let in a manager given the area', async () => {
      await expect(run(areaGuard(ManagerArea.Leads), leadsManager).result).resolves.toBe(true);
    });

    it('should send a manager without the area to the dashboard', async () => {
      await expect(run(areaGuard(ManagerArea.Visits), leadsManager).result).resolves.toBe('/admin');
    });
  });

  describe('editorTabGuard', () => {
    it('should open a page the manager can see', async () => {
      await expect(run(editorTabGuard, MANAGER, { tab: EditorTab.Hero }).result).resolves.toBe(
        true,
      );
    });

    it('should send a manager from a hidden page to the dashboard', async () => {
      await expect(run(editorTabGuard, MANAGER, { tab: EditorTab.Team }).result).resolves.toBe(
        '/admin',
      );
    });
  });

  describe('signedOutGuard', () => {
    it.each([
      ['the owner', OWNER],
      ['a manager', MANAGER],
    ])('should send %s, already signed in, to the admin home', async (_case, permissions) => {
      await expect(run(signedOutGuard, permissions).result).resolves.toBe('/admin');
    });

    it.each([
      ['a signed-out visitor', SIGNED_OUT],
      ['an account never added', STRANGER],
    ])('should show the sign-in page to %s', async (_case, permissions) => {
      await expect(run(signedOutGuard, permissions).result).resolves.toBe(true);
    });
  });
});
