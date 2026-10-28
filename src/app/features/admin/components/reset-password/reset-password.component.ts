import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { EMAIL_MAX_LENGTH } from '../../forms/auth-limits.constants';
import { type AdminPageModel } from '../../models/admin-page.model';
import { ResetPasswordViewModel } from '../../view-models/reset-password.view-model';
import { AuthCardComponent } from '../auth-card/auth-card.component';

/** Requests a password-reset email for the admin account. */
@Component({
  selector: 'app-reset-password',
  imports: [AuthCardComponent, ButtonDirective, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: '../sign-in/sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResetPasswordViewModel],
})
export default class ResetPasswordComponent extends BaseComponent<AdminPageModel> {
  protected override readonly model = inject(ResetPasswordViewModel);
  protected readonly signInRoute = AppRoute.AdminSignIn;
  protected readonly emailMax = EMAIL_MAX_LENGTH;

  /** @returns Whether the email error should show (invalid after the visitor left it). */
  protected showError(): boolean {
    const control = this.model.form.controls.email;
    return control.invalid && control.touched;
  }
}
