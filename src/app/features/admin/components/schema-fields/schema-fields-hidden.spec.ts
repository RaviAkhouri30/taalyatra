import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoAi } from '../../testing/editor-testing';
import { buildFormGroup } from '../../forms/schema-control.factory';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema } from '../../models/i-field-schema';
import { hideable } from '../../schemas/hideable';
import { SchemaFieldsComponent } from './schema-fields.component';

const FIELDS: readonly FieldSchema[] = [
  hideable({
    key: 'cards',
    label: 'Cards',
    kind: FieldKind.List,
    addLabel: 'Add card',
    maxItems: 3,
    item: {
      key: 'card',
      label: 'Card',
      kind: FieldKind.Group,
      fields: [{ key: 'heading', label: 'Heading', kind: FieldKind.Text }],
    },
  }),
];

@Component({
  imports: [SchemaFieldsComponent],
  template: '<app-schema-fields [fields]="fields" [group]="form()" idPrefix="h" />',
})
class HostComponent {
  public readonly fields = FIELDS;
  public readonly form = signal(
    buildFormGroup(FIELDS, { cards: [{ heading: 'Shown' }, { heading: 'Gone', hidden: true }] }),
  );
}

describe('SchemaFieldsComponent · hidden items (2.15.0)', () => {
  // The fields' AI help needs a route and the AI port; none is set up here (0025).
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideNoAi()] });
  });

  it('should give each item a Hidden switch and mark the hidden one', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const items = Array.from(element.querySelectorAll('.sf-item'));

    expect(items.map((item) => item.querySelector('[role="switch"]') !== null)).toEqual([
      true,
      true,
    ]);
    expect(items.map((item) => item.querySelector('.sf-hidden') !== null)).toEqual([false, true]);
    expect(items[1]?.classList.contains('sf-item--hidden')).toBe(true);
  });
});
