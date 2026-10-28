import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';
import { type Observable, firstValueFrom, of, throwError } from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { adminGuard } from './admin.guard';
import { signedOutGuard } from './signed-out.guard';

describe('admin guards', () => {
  function run(guard: typeof adminGuard, user: IAuthUser | null, signOut = () => of(undefined)) {
    const auth = { user$: of(user), signOut: vi.fn(signOut) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IAuthService, useValue: auth },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, adminUid: 'admin' } },
      ],
    });
    const result = TestBed.runInInjectionContext(() =>
      guard({} as never, {} as never),
    ) as Observable<boolean | UrlTree>;
    const serialize = (value: boolean | UrlTree) =>
      typeof value === 'boolean' ? value : TestBed.inject(Router).serializeUrl(value);
    return { result: firstValueFrom(result).then(serialize), auth };
  }

  describe('adminGuard', () => {
    it('should send a signed-out visitor to the sign-in page', async () => {
      await expect(run(adminGuard, null).result).resolves.toBe('/admin/sign-in');
    });

    it('should let the admin in', async () => {
      await expect(run(adminGuard, { uid: 'admin', email: 'a@b.c' }).result).resolves.toBe(true);
    });

    it('should sign out any other account and explain why', async () => {
      const { result, auth } = run(adminGuard, { uid: 'someone', email: 's@b.c' });

      await expect(result).resolves.toBe('/admin/sign-in?reason=not-admin');
      expect(auth.signOut).toHaveBeenCalled();
    });

    it('should still turn another account away when signing out fails', async () => {
      const { result } = run(adminGuard, { uid: 'someone', email: 's@b.c' }, () =>
        throwError(() => new Error('offline')),
      );

      await expect(result).resolves.toBe('/admin/sign-in?reason=not-admin');
    });
  });

  describe('signedOutGuard', () => {
    it('should send a signed-in admin to the admin home', async () => {
      await expect(run(signedOutGuard, { uid: 'admin', email: 'a@b.c' }).result).resolves.toBe(
        '/admin',
      );
    });

    it.each([
      ['a signed-out visitor', null],
      ['another account', { uid: 'someone', email: 's@b.c' }],
    ])('should show the sign-in page to %s', async (_case, user) => {
      await expect(run(signedOutGuard, user).result).resolves.toBe(true);
    });
  });
});
