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

describe('SchemaFieldsComponent · a group that depends on a switch', () => {
  it('should show the group only while its switch is on', async () => {
    const fields: FieldSchema[] = [
      { key: 'featured', label: 'Featured', kind: FieldKind.Toggle, offByDefault: true },
      {
        key: 'spotlight',
        label: 'Spotlight',
        kind: FieldKind.Group,
        onlyWhen: 'featured',
        fields: [{ key: 'title', label: 'Title', kind: FieldKind.Text }],
      },
    ];
    const fixture = TestBed.createComponent(SchemaFieldsComponent);
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('group', buildFormGroup(fields, {}));
    fixture.componentRef.setInput('idPrefix', 'x');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('fieldset')).toBeNull();

    element.querySelector<HTMLInputElement>('input[role="switch"]')?.click();
    await fixture.whenStable();

    expect(element.querySelector('legend')?.textContent).toBe('Spotlight');
  });
});

describe('SchemaFieldsComponent · a list with one switch on', () => {
  const fields: FieldSchema[] = [
    {
      key: 'cards',
      label: 'Cards',
      kind: FieldKind.List,
      addLabel: 'Add card',
      maxItems: 5,
      minItems: 1,
      item: {
        key: 'card',
        label: 'Card',
        kind: FieldKind.Group,
        fields: [
          {
            key: 'featured',
            label: 'Featured',
            kind: FieldKind.Toggle,
            offByDefault: true,
            oneInList: true,
          },
        ],
      },
    },
  ];

  function render(cards: readonly { featured: boolean }[]) {
    const fixture = TestBed.createComponent(SchemaFieldsComponent);
    const form = buildFormGroup(fields, { cards });
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('group', form);
    fixture.componentRef.setInput('idPrefix', 'x');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const switches = () =>
      Array.from(element.querySelectorAll<HTMLInputElement>('input[role="switch"]'));
    const removeButton = (position: number) =>
      element.querySelector<HTMLButtonElement>(`[aria-label="Remove Card ${String(position)}"]`);
    return { fixture, form, switches, removeButton };
  }

  it('should move the switch when another is turned on', () => {
    const { switches } = render([{ featured: true }, { featured: false }]);

    switches()[1]?.click();

    expect(switches().map((input) => input.checked)).toEqual([false, true]);
  });

  it('should keep the last one on', () => {
    const { switches } = render([{ featured: true }, { featured: false }]);

    switches()[0]?.click();

    expect(switches().map((input) => input.checked)).toEqual([true, false]);
  });

  it('should pass the switch on when the item that had it is removed', async () => {
    const { fixture, switches, removeButton } = render([{ featured: true }, { featured: false }]);

    removeButton(1)?.click();
    await fixture.whenStable();

    expect(switches().map((input) => input.checked)).toEqual([true]);
  });

  it('should stop removing at the minimum', () => {
    const { removeButton } = render([{ featured: true }]);

    expect(removeButton(1)?.disabled).toBe(true);
  });
});
