import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './auth-limits.constants';

/**
 * name@domain.tld: one "@", no spaces, a dot in the domain and a TLD of at least two letters.
 * Stricter than `Validators.email`, which accepts "a@b".
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

/**
 * Required, ignoring surrounding spaces.
 * @returns `null` when filled in, else `{ required: true }`.
 */
export const requiredTrimmedValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => (String(control.value ?? '').trim() ? null : { required: true });

/**
 * A plausible email address of at most 254 characters; empty passes (`required` reports it).
 * @returns `null` when valid or empty, else `{ email: true }`.
 */
export const emailAddressValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value) ? null : { email: true };
};

/**
 * Between 6 and 128 characters; empty passes (`required` reports it). Spaces count: they can be
 * part of a password.
 * @returns `null` when valid or empty, else `{ passwordLength: true }`.
 */
export const passwordLengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const length = String(control.value ?? '').length;
  if (length === 0) {
    return null;
  }
  return length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH
    ? null
    : { passwordLength: true };
};
