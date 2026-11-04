import { FormArray, FormControl, FormRecord } from '@angular/forms';
import { ensureOneOn, keepOneOn } from './one-in-list';

describe('one switch on in a list', () => {
  const item = (on: boolean) => new FormRecord({ featured: new FormControl(on) });
  const values = (list: FormArray) =>
    list.controls.map((entry) => entry.get('featured')?.value as boolean);

  it('should turn the others off when one is turned on', () => {
    const list = new FormArray([item(true), item(true), item(false)]);

    keepOneOn(list.controls[1]!.get('featured')!, 'featured');

    expect(values(list)).toEqual([false, true, false]);
  });

  it('should keep the last one on when it is turned off', () => {
    const list = new FormArray([item(false), item(false)]);

    keepOneOn(list.controls[0]!.get('featured')!, 'featured');

    expect(values(list)).toEqual([true, false]);
  });

  it('should leave it off when another is still on', () => {
    const list = new FormArray([item(false), item(true)]);

    keepOneOn(list.controls[0]!.get('featured')!, 'featured');

    expect(values(list)).toEqual([false, true]);
  });

  it('should do nothing for a switch outside a list', () => {
    const control = new FormControl(false);

    keepOneOn(control, 'featured');

    expect(control.value).toBe(false);
  });

  it('should turn the first on when the one that was on is gone', () => {
    const list = new FormArray([item(false), item(false)]);

    ensureOneOn(list, 'featured');

    expect(values(list)).toEqual([true, false]);
  });

  it('should change nothing when one is on, or the list is empty', () => {
    const list = new FormArray([item(false), item(true)]);
    ensureOneOn(list, 'featured');
    expect(values(list)).toEqual([false, true]);

    const empty = new FormArray<ReturnType<typeof item>>([]);
    expect(() => {
      ensureOneOn(empty, 'featured');
    }).not.toThrow();
  });
});
