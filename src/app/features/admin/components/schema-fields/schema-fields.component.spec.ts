import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type FormArray } from '@angular/forms';
import { buildFormGroup } from '../../forms/schema-control.factory';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema } from '../../models/i-field-schema';
import { SchemaFieldsComponent } from './schema-fields.component';

const FIELDS: FieldSchema[] = [
  {
    key: 'title',
    label: 'Title',
    kind: FieldKind.Text,
    required: true,
    maxLength: 20,
    recommended: 10,
  },
  {
    key: 'brand',
    label: 'Brand',
    kind: FieldKind.Group,
    fields: [{ key: 'name', label: 'Name', kind: FieldKind.Text }],
  },
  {
    key: 'tags',
    label: 'Tags',
    kind: FieldKind.List,
    addLabel: 'Add tag',
    maxItems: 3,
    item: { key: 'tag', label: 'Tag', kind: FieldKind.Text },
  },
  {
    key: 'cards',
    label: 'Cards',
    kind: FieldKind.List,
    addLabel: 'Add card',
    maxItems: 2,
    item: {
      key: 'card',
      label: 'Card',
      kind: FieldKind.Group,
      fields: [{ key: 'heading', label: 'Card heading', kind: FieldKind.Text }],
    },
  },
];

@Component({
  imports: [SchemaFieldsComponent],
  template: '<app-schema-fields [fields]="fields" [group]="form()" idPrefix="t" />',
})
class HostComponent {
  public readonly fields = FIELDS;
  public readonly form = signal(
    buildFormGroup(FIELDS, {
      title: 'Hi',
      brand: { name: 'TY' },
      tags: ['a', 'b'],
      cards: [{ heading: 'One' }],
    }),
  );
}

describe('SchemaFieldsComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) =>
          (candidate.getAttribute('aria-label') ?? candidate.textContent.trim()) === name,
      )!;
    const tags = () => fixture.componentInstance.form().get('tags') as FormArray;
    return { fixture, element, button, tags };
  }

  it('should render fields, groups as fieldsets and list items with their positions', () => {
    const { element } = render();

    expect(element.querySelector<HTMLInputElement>('#t-title')?.value).toBe('Hi');
    expect(element.querySelector('fieldset legend')?.textContent).toBe('Brand');
    expect(element.querySelector<HTMLInputElement>('#t-brand-name')?.value).toBe('TY');
    expect(element.querySelector<HTMLInputElement>('#t-tags-1')?.value).toBe('b');
    expect(element.querySelector('.sf-item-title')?.textContent).toContain('Card 1');
    expect(element.querySelector<HTMLInputElement>('#t-cards-0-heading')?.value).toBe('One');
  });

  it('should add, move and remove list items', () => {
    const { fixture, button, tags } = render();

    button('+ Add tag').click();
    fixture.detectChanges();
    button('Move Tag 1 down').click();
    button('Remove Tag 3').click();

    expect(tags().getRawValue()).toEqual(['b', 'a']);
  });

  it('should stop adding at the list limit and disable moves at either end', () => {
    const { fixture, button } = render();

    button('+ Add card').click();
    fixture.detectChanges();

    expect(button('+ Add card').disabled).toBe(true);
    expect(button('Move Card 1 up').disabled).toBe(true);
    expect(button('Move Card 2 down').disabled).toBe(true);
  });
});
