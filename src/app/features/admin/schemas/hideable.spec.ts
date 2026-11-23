import fakeDb from '@core/backends/fake/fake-db.json';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema, type IListFieldSchema } from '../models/i-field-schema';
import { ALL_SECTIONS } from './editor-tabs';
import { HIDDEN_FIELD, hideable } from './hideable';

/** @returns Every list among some fields, groups opened. */
function listsIn(fields: readonly FieldSchema[]): IListFieldSchema[] {
  return fields.flatMap((field) => {
    if (field.kind === FieldKind.Group) {
      return listsIn(field.fields);
    }
    return field.kind === FieldKind.List ? [field] : [];
  });
}

describe('hideable lists (2.15.0)', () => {
  it('should add a Hidden switch, off by default, last, and mark the list', () => {
    const list = hideable({
      key: 'items',
      label: 'Items',
      kind: FieldKind.List,
      addLabel: 'Add',
      maxItems: 3,
      item: { key: 'item', label: 'Item', kind: FieldKind.Group, fields: [] },
    });

    expect(list.hideable).toBe(true);
    expect(list.item.kind === FieldKind.Group ? list.item.fields : []).toEqual([HIDDEN_FIELD]);
    expect(HIDDEN_FIELD).toMatchObject({ kind: FieldKind.Toggle, offByDefault: true });
  });

  it('should make the eight lists of the inception hideable, and no other', () => {
    const hideableIn = ALL_SECTIONS.filter((section) =>
      listsIn(section.fields).some((list) => list.hideable === true),
    ).map((section) => section.id);

    expect(new Set(hideableIn)).toEqual(
      new Set([
        'achievements-milestones',
        'faq',
        'gallery-photos',
        'offer',
        'proof-testimonials',
        'shows-formats',
        'team-members',
        'videos-list',
      ]),
    );
    expect(fakeDb.videos.length).toBeGreaterThan(0);
  });
});
