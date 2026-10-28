import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { type AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError, IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { createSignInForm } from '../forms/auth-forms';
import { AdminPageViewModel } from './admin-page.view-model';

/** Owns the sign-in form: validates it, signs in, and reports why a sign-in failed. */
@Injectable()
export class SignInViewModel extends AdminPageViewModel {
  public readonly form = createSignInForm();
  /** True while a sign-in request is in flight. */
  public readonly submitting = signal(false);
  /** Why the last sign-in failed, or `null`. */
  public readonly failure = signal<AuthErrorKind | null>(null);

  private readonly auth = inject(IAuthService);
  private readonly router = inject(Router);
  private readonly submits = new Subject<void>();

  /** Signs in, or reveals the field errors when the form is invalid. */
  public submit(): void {
    this.submits.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.submits.pipe(
      tap(() => {
        this.form.markAllAsTouched();
      }),
      filter(() => this.form.valid),
      // exhaustMap: clicks while signing in are ignored, never a second request.
      exhaustMap(() => this.signIn()),
    );
  }

  private signIn(): Observable<unknown> {
    // defer: the status changes when the request starts, not when it is built.
    return defer(() => {
      const { email, password } = this.form.getRawValue();
      this.failure.set(null);
      this.submitting.set(true);
      return this.auth.signIn(email.trim(), password).pipe(
        tap(() => {
          // The navigation's result isn't needed: adminGuard decides what renders.
          void this.router.navigateByUrl(AppRoute.Admin);
        }),
        // A failure is shown, and the stream stays alive for the next attempt.
        catchError((error: unknown) => {
          this.failure.set(AuthError.kindOf(error));
          this.form.controls.password.reset();
          return EMPTY;
        }),
        finalize(() => {
          this.submitting.set(false);
        }),
      );
    });
  }
}
