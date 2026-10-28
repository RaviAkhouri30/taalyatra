import { FormControl, FormGroup } from '@angular/forms';
import {
  emailAddressValidator,
  passwordLengthValidator,
  requiredTrimmedValidator,
} from './auth.validators';

/** Typed controls of the sign-in form. */
export interface ISignInControls {
  readonly email: FormControl<string>;
  readonly password: FormControl<string>;
}

/** Typed controls of the password-reset form. */
export interface IResetPasswordControls {
  readonly email: FormControl<string>;
}

/** @returns An email control: required (ignoring spaces) and a plausible address. */
function emailControl(): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [requiredTrimmedValidator, emailAddressValidator],
  });
}

/**
 * Builds the typed sign-in form (CLAUDE.md §6: typed Reactive Forms, validators kept apart).
 * @returns A new form group.
 */
export function createSignInForm(): FormGroup<ISignInControls> {
  return new FormGroup<ISignInControls>({
    email: emailControl(),
    password: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmedValidator, passwordLengthValidator],
    }),
  });
}

/** @returns A new typed password-reset form. */
export function createResetPasswordForm(): FormGroup<IResetPasswordControls> {
  return new FormGroup<IResetPasswordControls>({ email: emailControl() });
}
