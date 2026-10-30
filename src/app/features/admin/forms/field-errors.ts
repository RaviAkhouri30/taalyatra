import { type ValidationErrors } from '@angular/forms';

/** What each validator error asks the owner to do. Checked in this order; the first wins. */
const MESSAGES: readonly (readonly [string, (detail: unknown) => string])[] = [
  ['required', () => 'Fill this in.'],
  [
    'maxlength',
    (detail) => `Use at most ${String(numberIn(detail, 'requiredLength'))} characters.`,
  ],
  ['url', () => 'Use a full link, starting with https://.'],
  ['phone', () => 'Use the international format, for example +919284276168.'],
  ['email', () => 'Use a valid email address.'],
  ['date', () => 'Use a valid date.'],
  ['min', (detail) => `Use a number of at least ${String(numberIn(detail, 'min'))}.`],
  ['max', (detail) => `Use a number of at most ${String(numberIn(detail, 'max'))}.`],
];

function numberIn(detail: unknown, key: string): number {
  const value: unknown =
    typeof detail === 'object' && detail !== null ? new Map(Object.entries(detail)).get(key) : 0;
  return typeof value === 'number' ? value : 0;
}

/**
 * @param errors A control's validation errors.
 * @returns What to tell the owner, or `null` when there's nothing to fix.
 */
export function fieldErrorMessage(errors: ValidationErrors | null): string | null {
  if (errors === null) {
    return null;
  }
  const found = MESSAGES.find(([key]) => key in errors);
  return found ? found[1](errors[found[0]]) : 'Check this value.';
}
