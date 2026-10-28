import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../../forms/auth-limits.constants';
import { type ISignInControls } from '../../forms/auth-forms';
import { type AdminPageModel } from '../../models/admin-page.model';
import { SignInReason } from '../../models/sign-in-reason.enum';
import { SignInViewModel } from '../../view-models/sign-in.view-model';
import { AuthCardComponent } from '../auth-card/auth-card.component';

/** Admin sign-in (design `Admin.dc.html`): email, password, and a link to reset the password. */
@Component({
  selector: 'app-sign-in',
  imports: [AuthCardComponent, ButtonDirective, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SignInViewModel],
})
export default class SignInComponent extends BaseComponent<AdminPageModel> {
  /** `reason` query parameter, bound by the router (`withComponentInputBinding`). */
  public readonly reason = input<string>();

  protected override readonly model = inject(SignInViewModel);
  protected readonly notAdmin = computed(() => this.reason() === SignInReason.NotAdmin);
  protected readonly resetRoute = AppRoute.AdminResetPassword;
  protected readonly emailMax = EMAIL_MAX_LENGTH;
  protected readonly passwordMax = PASSWORD_MAX_LENGTH;

  /** @returns Whether `field`'s error should show (invalid after the visitor left it). */
  protected showError(field: keyof ISignInControls): boolean {
    const control = this.model.form.get(field);
    return Boolean(control?.invalid && control.touched);
  }
}
