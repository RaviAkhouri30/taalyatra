import { type AbstractControl, FormArray } from '@angular/forms';

function switchOf(item: AbstractControl, key: string): AbstractControl | null {
  return item.get(key);
}

/**
 * For a switch only one list item may have on (the featured experience). Turning one on turns the
 * others off, and the last one can't be turned off, so there's always exactly one.
 *
 * @param control The switch the owner just changed.
 * @param key Its key in each list item.
 */
export function keepOneOn(control: AbstractControl, key: string): void {
  const list = control.parent?.parent;
  if (!(list instanceof FormArray)) {
    return;
  }
  if (control.value === true) {
    for (const item of list.controls) {
      const other = switchOf(item, key);
      if (other !== control) {
        // No event: the change that brought us here already triggers one save.
        other?.setValue(false, { emitEvent: false });
      }
    }
    return;
  }
  if (!list.controls.some((item) => switchOf(item, key)?.value === true)) {
    control.setValue(true);
  }
}

/**
 * After removing an item: when it was the one that was on, the first remaining item takes over.
 *
 * @param list The list.
 * @param key The switch's key in each item.
 */
export function ensureOneOn(list: FormArray, key: string): void {
  if (!list.controls.some((item) => switchOf(item, key)?.value === true)) {
    list.controls.at(0)?.get(key)?.setValue(true);
  }
}
