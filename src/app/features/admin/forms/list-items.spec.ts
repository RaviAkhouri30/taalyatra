import { FormArray, FormControl } from '@angular/forms';
import { moveListItem } from './list-items';

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
});
