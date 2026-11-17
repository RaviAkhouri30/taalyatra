import { FormArray, FormControl } from '@angular/forms';
import { moveListItem, moveListItemTo } from './list-items';

describe('moveListItem', () => {
  const list = () =>
    new FormArray([new FormControl('a'), new FormControl('b'), new FormControl('c')]);

  it('should move an item up and down', () => {
    const items = list();

    moveListItem(items, 2, -1);
    expect(items.getRawValue()).toEqual(['a', 'c', 'b']);
    moveListItem(items, 0, 1);
    expect(items.getRawValue()).toEqual(['c', 'a', 'b']);
  });

  it('should leave the list as it is at either end', () => {
    const items = list();

    moveListItem(items, 0, -1);
    moveListItem(items, 2, 1);

    expect(items.getRawValue()).toEqual(['a', 'b', 'c']);
  });

  it('should move an item to a new place in one change, as a drag does', () => {
    const list = new FormArray([new FormControl('a'), new FormControl('b'), new FormControl('c')]);
    const changes = vi.fn();
    list.valueChanges.subscribe(changes);

    moveListItemTo(list, 2, 0);

    expect(list.value).toEqual(['c', 'a', 'b']);
    expect(changes).toHaveBeenCalledTimes(1);
  });

  it.each([
    [0, 0],
    [5, 0],
    [0, 3],
  ])('should leave the list alone for a move from %i to %i', (from, to) => {
    const list = new FormArray([new FormControl('a'), new FormControl('b')]);

    moveListItemTo(list, from, to);

    expect(list.value).toEqual(['a', 'b']);
  });
});
