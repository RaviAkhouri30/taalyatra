import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import { firstValueFrom, of, throwError } from 'rxjs';
import { FAKE_ADMIN_ACCOUNT } from '@core/backends/fake/fake-auth.constants';
import { AdminHomeViewModel } from './admin-home.view-model';

describe('AdminHomeViewModel', () => {
  async function create(auth?: Partial<IAuthService>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        auth
          ? { provide: IAuthService, useValue: auth }
          : { provide: IAuthService, useClass: FakeAuthService },
        AdminHomeViewModel,
      ],
    });
    if (!auth) {
      await firstValueFrom(
        TestBed.inject(IAuthService).signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password),
      );
    }
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const model = TestBed.inject(AdminHomeViewModel);
    model.init().subscribe();
    return { model, navigate };
  }

  it('should show the signed-in email', async () => {
    const { model } = await create();

    expect(model.email()).toBe(FAKE_ADMIN_ACCOUNT.email);
  });

  it('should sign out and return to the sign-in page', async () => {
    const { model, navigate } = await create();

    model.signOut();

    expect(model.signingOut()).toBe(true);
    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin/sign-in');
    });
    expect(model.email()).toBe('');
    expect(model.signingOut()).toBe(false);
  });

  it('should stay on the page when signing out fails', async () => {
    const { model, navigate } = await create({
      user$: of(null),
      signOut: () => throwError(() => new Error('offline')),
    });

    model.signOut();

    expect(navigate).not.toHaveBeenCalled();
    expect(model.signingOut()).toBe(false);
  });
});
