import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/**
 * A Firebase User UID as the console shows it: letters, digits, `-` or `_`. No `/`, so it can
 * only ever name its own `roles/{uid}` document.
 */
const ACCOUNT_ID_PATTERN = /^[\w-]{6,128}$/;

/**
 * A plausible account id; empty passes (`required` reports it).
 * @returns `null` when valid or empty, else `{ accountId: true }`.
 */
export const accountIdValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  return !value || ACCOUNT_ID_PATTERN.test(value) ? null : { accountId: true };
};

/**
 * The owner can't be added as a manager: they're fixed in the rules (decision 1), which refuse it
 * too.
 * @param ownerUid The owner's account id.
 * @returns A validator giving `{ ownerAccount: true }` for the owner's id.
 */
export function notOwnerValidator(ownerUid: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    String(control.value ?? '').trim() === ownerUid ? { ownerAccount: true } : null;
}

/**
 * Adding an account that's already a manager would replace their settings unseen.
 * @param listed The ids already on Team access, read when the control is checked.
 * @returns A validator giving `{ listedAccount: true }` for one of them.
 */
export function notListedValidator(listed: () => ReadonlySet<string>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    listed().has(String(control.value ?? '').trim()) ? { listedAccount: true } : null;
}

/**
 * A super manager's last day (0024 D3): with the switch on and an end chosen, a day that is today
 * or later. Set on the form, since it depends on the switch and the choice beside it.
 * @param today Today in India, `YYYY-MM-DD`, read when the form is checked.
 * @returns A validator giving `{ superUntil: true }` for a missing or past day.
 */
export function superUntilValidator(today: () => string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const value: unknown = form.value;
    const fields = new Map(
      typeof value === 'object' && value !== null ? Object.entries(value) : [],
    );
    const day = String(fields.get('superUntil') ?? '');
    const needsDay = fields.get('superManager') === true && fields.get('superEnds') === true;
    // YYYY-MM-DD compares as text; an empty or malformed day sorts before any real one.
    return needsDay && !(/^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today())
      ? { superUntil: true }
      : null;
  };
}
