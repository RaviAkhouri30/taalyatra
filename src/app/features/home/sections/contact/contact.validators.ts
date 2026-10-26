import {
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
  Validators,
} from '@angular/forms';

/** An Indian mobile number: 10 digits, optionally prefixed with the 91 country code. */
const LOCAL_DIGITS = 10;
const COUNTRY_CODE = '91';

/**
 * Accepts a 10-digit number written with spaces, dashes or a +91 prefix.
 * @returns `null` when valid, else `{ phone: true }`.
 */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const digits = String(control.value ?? '').replace(/\D/g, '');
  const local =
    digits.length === LOCAL_DIGITS + COUNTRY_CODE.length && digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits;
  return local.length === LOCAL_DIGITS ? null : { phone: true };
};

/**
 * Like `Validators.required`, but a value of only spaces does not count.
 * @returns `null` when filled in, else `{ required: true }`.
 */
export const requiredTextValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => (String(control.value ?? '').trim() ? null : { required: true });

/**
 * Optional email: empty passes, otherwise `Validators.email` applies.
 * @returns `null` when empty or valid, else `{ email: true }`.
 */
export const optionalEmailValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  String(control.value ?? '').trim() ? Validators.email(control) : null;
