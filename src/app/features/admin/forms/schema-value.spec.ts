import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema } from '../models/i-field-schema';
import { mergeSchemaValue, readSchemaValue } from './schema-value';

describe('schema value', () => {
  const fields: FieldSchema[] = [
    { key: 'title', label: 'Title', kind: FieldKind.Text },
    { key: 'startsOn', label: 'Starts', kind: FieldKind.Date },
    {
      key: 'promotion',
      label: 'Promotion',
      kind: FieldKind.Group,
      fields: [{ key: 'label', label: 'Label', kind: FieldKind.Text }],
    },
    {
      key: 'cards',
      label: 'Cards',
      kind: FieldKind.List,
      addLabel: 'Add',
      maxItems: 3,
      item: {
        key: 'card',
        label: 'Card',
        kind: FieldKind.Group,
        fields: [{ key: 'title', label: 'Title', kind: FieldKind.Text }],
      },
    },
  ];

  it('should read a form value into stored values, storing an empty date as null', () => {
    const values = readSchemaValue(fields, {
      title: 'Hi',
      startsOn: ' ',
      promotion: { label: 'Diwali' },
      cards: [{ title: 'One' }],
    });

    expect(values).toEqual({
      title: 'Hi',
      startsOn: null,
      promotion: { label: 'Diwali' },
      cards: [{ title: 'One' }],
    });
  });

  it('should keep a filled date and read a missing list as empty', () => {
    expect(readSchemaValue(fields, { startsOn: '2026-11-01' })).toMatchObject({
      startsOn: '2026-11-01',
      cards: [],
    });
  });

  it('should merge edited fields into the document and keep everything else', () => {
    const document = {
      title: 'Old',
      theme: 'sparks',
      promotion: { label: 'Old', dismissLabel: 'Close' },
    };

    const merged = mergeSchemaValue(document, fields, {
      title: 'New',
      startsOn: null,
      promotion: { label: 'New' },
      cards: [],
    });

    expect(merged).toEqual({
      title: 'New',
      theme: 'sparks',
      startsOn: null,
      promotion: { label: 'New', dismissLabel: 'Close' },
      cards: [],
    });
    expect(document.title).toBe('Old');
  });

  it('should start from an empty document when there is none yet', () => {
    expect(mergeSchemaValue(null, fields.slice(0, 1), { title: 'First' })).toEqual({
      title: 'First',
    });
  });
});
