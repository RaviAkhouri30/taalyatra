import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import { of, throwError } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';
import { ResetPasswordViewModel } from './reset-password.view-model';

describe('ResetPasswordViewModel', () => {
  function create(sendPasswordReset: IAuthService['sendPasswordReset']) {
    const send = vi.fn(sendPasswordReset);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        { provide: IAuthService, useValue: { sendPasswordReset: send } },
        ResetPasswordViewModel,
      ],
    });
    const model = TestBed.inject(ResetPasswordViewModel);
    model.init().subscribe();
    model.form.setValue({ email: ' owner@example.com ' });
    return { model, send };
  }

  it('should send the reset email with a link back to sign-in, then confirm', () => {
    const { model, send } = create(() => of(undefined));

    model.submit();

    expect(send).toHaveBeenCalledWith('owner@example.com', '/admin/sign-in');
    expect(model.sent()).toBe(true);
  });

  it('should confirm the same way for an email without an account', () => {
    const { model } = create(() =>
      throwError(() => new AuthError(AuthErrorKind.InvalidCredentials)),
    );

    model.submit();

    expect(model.sent()).toBe(true);
    expect(model.failure()).toBeNull();
  });

  it('should report a rate limit or network failure instead', () => {
    const { model } = create(() => throwError(() => new AuthError(AuthErrorKind.TooManyAttempts)));

    model.submit();

    expect(model.sent()).toBe(false);
    expect(model.failure()).toBe(AuthErrorKind.TooManyAttempts);
  });

  it('should send nothing while the email is invalid', () => {
    const { model, send } = create(() => of(undefined));
    model.form.setValue({ email: 'owner@example' });

    model.submit();

    expect(send).not.toHaveBeenCalled();
  });
});
