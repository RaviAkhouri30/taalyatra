import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ListOrderComponent } from './list-order.component';

describe('ListOrderComponent', () => {
  function show(title: string, featured = false) {
    return new FormGroup({
      title: new FormControl(title, { nonNullable: true }),
      featured: new FormControl(featured, { nonNullable: true }),
    });
  }

  async function render(items: FormArray) {
    const fixture = TestBed.createComponent(ListOrderComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('sortable', { titleKey: 'title', featuredKey: 'featured' });
    fixture.componentRef.setInput('itemLabel', 'Show');
    fixture.componentRef.setInput('value', items.value);
    // As the editor does: a new value after every change to the list.
    items.valueChanges.subscribe((value) => {
      fixture.componentRef.setInput('value', value);
    });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      names: () => Array.from(element.querySelectorAll('.lo-name'), (name) => name.textContent),
      button: (label: string) =>
        element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!,
    };
  }

  it('should list the items by title, in order', async () => {
    const { names } = await render(new FormArray([show('Live band'), show('Acoustic')]));

    expect(names()).toEqual(['Live band', 'Acoustic']);
  });

  it('should move an item with its arrow buttons, in the form list too', async () => {
    const items = new FormArray([show('Live band'), show('Acoustic'), show('Fusion')]);
    const { fixture, names, button } = await render(items);

    button('Move Fusion up').click();
    await fixture.whenStable();

    expect(names()).toEqual(['Live band', 'Fusion', 'Acoustic']);
    expect(items.getRawValue().map((item) => item.title)).toEqual([
      'Live band',
      'Fusion',
      'Acoustic',
    ]);
  });

  it('should move by the item’s current place when pressed twice quickly', async () => {
    const items = new FormArray([show('A'), show('B'), show('C')]);
    const { fixture, button } = await render(items);
    const up = button('Move C up');

    up.click();
    up.click();
    await fixture.whenStable();

    expect(items.getRawValue().map((item) => item.title)).toEqual(['C', 'A', 'B']);
  });

  it('should pin the featured item first, and move an item switched to featured there', async () => {
    const items = new FormArray([show('A'), show('B', true), show('C')]);
    const { fixture, names, button } = await render(items);

    expect(names()).toEqual(['B', 'A', 'C']);
    expect(button('Move A up').disabled).toBe(true);
    expect(button('Move B down').disabled).toBe(true);

    items.at(2).get('featured')?.setValue(true);
    items.at(0).get('featured')?.setValue(false);
    await fixture.whenStable();

    expect(names()[0]).toBe('C');
  });

  it('should name an untitled item by its label and place', async () => {
    const { names } = await render(new FormArray([show('')]));

    expect(names()).toEqual(['Show 1']);
  });
});
