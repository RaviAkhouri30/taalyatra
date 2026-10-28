import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import { throwError } from 'rxjs';
import { FAKE_ADMIN_ACCOUNT } from '@core/backends/fake/fake-auth.constants';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';
import { AdminPageModel } from '../models/admin-page.model';
import { SignInViewModel } from './sign-in.view-model';

describe('SignInViewModel', () => {
  function create(auth: Partial<IAuthService> | null = null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        auth
          ? { provide: IAuthService, useValue: auth }
          : { provide: IAuthService, useClass: FakeAuthService },
        SignInViewModel,
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const model = TestBed.inject(SignInViewModel);
    model.init().subscribe();
    return { model, navigate };
  }

  it('should load the copy and brand', () => {
    expect(create().model.data()).toBeInstanceOf(AdminPageModel);
  });

  it('should reveal the field errors and send nothing when the form is invalid', () => {
    const signIn = vi.fn();
    const { model } = create({ signIn });

    model.submit();

    expect(model.form.controls.email.touched).toBe(true);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('should sign the admin in and go to the admin home', async () => {
    const { model, navigate } = create();
    model.form.setValue({
      email: ` ${FAKE_ADMIN_ACCOUNT.email} `,
      password: FAKE_ADMIN_ACCOUNT.password,
    });

    model.submit();

    expect(model.submitting()).toBe(true);
    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin');
    });
    expect(model.failure()).toBeNull();
    expect(model.submitting()).toBe(false);
  });

  it('should report a failure, clear the password and stay ready for another attempt', () => {
    const { model, navigate } = create({
      signIn: () => throwError(() => new AuthError(AuthErrorKind.InvalidCredentials)),
    });
    model.form.setValue({ email: 'owner@example.com', password: 'wrong-password' });

    model.submit();

    expect(model.failure()).toBe(AuthErrorKind.InvalidCredentials);
    expect(model.form.controls.password.value).toBe('');
    expect(navigate).not.toHaveBeenCalled();
  });
});
