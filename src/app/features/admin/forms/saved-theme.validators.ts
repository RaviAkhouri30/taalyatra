import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';
import { nameKey } from '../models/saved-theme.model';

/**
 * Two saved themes under one name couldn't be told apart in the list (0027 D4). Case and spaces
 * are ignored, so "Spring show" and "spring  show" are the same name. Empty passes (`required`
 * reports it).
 * @param taken The names in use, read when the control is checked; while renaming, without the
 *   theme's own.
 * @returns A validator giving `{ nameTaken: true }` for one of them.
 */
export function nameNotTakenValidator(taken: () => readonly string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const key = nameKey(String(control.value ?? ''));
    return key && taken().some((name) => nameKey(name) === key) ? { nameTaken: true } : null;
  };
}
