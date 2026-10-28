import { Injectable, inject, signal } from '@angular/core';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  defer,
  exhaustMap,
  filter,
  finalize,
  tap,
} from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError, IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { createResetPasswordForm } from '../forms/auth-forms';
import { AdminPageViewModel } from './admin-page.view-model';

/**
 * Owns the reset form. The confirmation is the same whether or not the email has an account, so
 * the page never reveals which emails exist.
 */
@Injectable()
export class ResetPasswordViewModel extends AdminPageViewModel {
  public readonly form = createResetPasswordForm();
  public readonly submitting = signal(false);
  /** True once a reset was requested (shown for unknown emails too). */
  public readonly sent = signal(false);
  /** A failure worth reporting (rate limit, network), or `null`. */
  public readonly failure = signal<AuthErrorKind | null>(null);

  private readonly auth = inject(IAuthService);
  private readonly submits = new Subject<void>();

  /** Sends the reset email, or reveals the field error when the form is invalid. */
  public submit(): void {
    this.submits.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.submits.pipe(
      tap(() => {
        this.form.markAllAsTouched();
      }),
      filter(() => this.form.valid),
      // exhaustMap: clicks while sending are ignored, never a second email.
      exhaustMap(() => this.requestReset()),
    );
  }

  private requestReset(): Observable<unknown> {
    return defer(() => {
      this.failure.set(null);
      this.submitting.set(true);
      return this.auth
        .sendPasswordReset(this.form.getRawValue().email.trim(), AppRoute.AdminSignIn)
        .pipe(
          tap(() => {
            this.sent.set(true);
          }),
          catchError((error: unknown) => {
            const kind = AuthError.kindOf(error);
            // An unknown email looks exactly like success (no account enumeration).
            if (kind === AuthErrorKind.InvalidCredentials) {
              this.sent.set(true);
            } else {
              this.failure.set(kind);
            }
            return EMPTY;
          }),
          finalize(() => {
            this.submitting.set(false);
          }),
        );
    });
  }
}
