import { type FormArray } from '@angular/forms';

/**
 * Moves a list item up or down; does nothing at either end.
 *
 * @param list The list's controls.
 * @param index The item to move.
 * @param offset -1 to move up, 1 to move down.
 */
export function moveListItem(list: FormArray, index: number, offset: number): void {
  const target = index + offset;
  const item = list.controls.at(index);
  if (item === undefined || target < 0 || target >= list.length) {
    return;
  }
  list.removeAt(index, { emitEvent: false });
  // Emits once, so a move is saved as one change.
  list.insert(target, item);
}
