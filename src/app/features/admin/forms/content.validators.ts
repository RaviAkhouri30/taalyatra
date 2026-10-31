import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/** A web address: http(s), then no spaces. Shown on the site as a link. */
const URL_PATTERN = /^https?:\/\/\S+$/;

/** International phone format (E.164): +, country code, 8 to 15 digits in all. */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/** The stored date format; the browser's date input produces it. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Builds a validator that checks a pattern, letting an empty value pass (`required` reports it).
 *
 * @param pattern The pattern the value must match.
 * @param error The error key to report.
 * @returns The validator.
 */
function patternValidator(pattern: RegExp, error: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    return !value || pattern.test(value) ? null : { [error]: true };
  };
}

/** A link starting with http:// or https://; empty passes. */
export const urlValidator: ValidatorFn = patternValidator(URL_PATTERN, 'url');

/** A phone number in international format, e.g. +919284276168; empty passes. */
export const phoneE164Validator: ValidatorFn = patternValidator(E164_PATTERN, 'phone');

/** A date as YYYY-MM-DD; empty passes (no date). */
export const dateValidator: ValidatorFn = patternValidator(DATE_PATTERN, 'date');
