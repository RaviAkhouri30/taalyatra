import { type FormArray, type FormControl, FormRecord } from '@angular/forms';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema, type IListFieldSchema } from '../models/i-field-schema';
import { buildControl, buildFormGroup, buildListItem } from './schema-control.factory';

describe('schema control factory', () => {
  const fields: FieldSchema[] = [
    { key: 'title', label: 'Title', kind: FieldKind.Text, required: true, maxLength: 5 },
    { key: 'site', label: 'Site', kind: FieldKind.Url },
    { key: 'year', label: 'Year', kind: FieldKind.Number, min: 2020, max: 2100 },
    { key: 'live', label: 'Live', kind: FieldKind.Toggle },
    {
      key: 'theme',
      label: 'Theme',
      kind: FieldKind.Choice,
      options: [
        { value: 'sparks', label: 'Sparks' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      key: 'brand',
      label: 'Brand',
      kind: FieldKind.Group,
      fields: [{ key: 'name', label: 'Name', kind: FieldKind.Text }],
    },
  ];
  const tags: IListFieldSchema = {
    key: 'tags',
    label: 'Tags',
    kind: FieldKind.List,
    addLabel: 'Add tag',
    maxItems: 3,
    item: { key: 'tag', label: 'Tag', kind: FieldKind.Text },
  };

  it('should fill every control from the stored document', () => {
    const form = buildFormGroup(fields, {
      title: 'Hello',
      site: 'https://x.in',
      year: 2026,
      live: false,
      theme: 'none',
      brand: { name: 'Taal Yatra' },
    });

    expect(form.getRawValue()).toEqual({
      title: 'Hello',
      site: 'https://x.in',
      year: 2026,
      live: false,
      theme: 'none',
      brand: { name: 'Taal Yatra' },
    });
  });

  it('should fall back to safe values when the document is missing or damaged', () => {
    const form = buildFormGroup(fields, { title: 42, year: '2026', theme: 'holi' });

    expect(form.getRawValue()).toEqual({
      title: '',
      site: '',
      year: 2020,
      live: true,
      theme: 'sparks',
      brand: { name: '' },
    });
  });

  it('should validate required, length and format', () => {
    const form = buildFormGroup(fields, { title: 'Too long', site: 'x.in' });

    expect(form.get('title')?.errors).toHaveProperty('maxlength');
    expect(form.get('site')?.errors).toEqual({ url: true });
    form.get('title')?.setValue('  ');
    expect(form.get('title')?.errors).toEqual({ required: true });
  });

  it('should build a list with one control per stored item, and blank new items', () => {
    const list = buildControl(tags, ['a', 'b']) as FormArray;

    expect(list.getRawValue()).toEqual(['a', 'b']);
    expect((buildListItem(tags) as FormControl<string>).value).toBe('');
    expect(buildControl(tags, 'not a list') as FormArray).toHaveLength(0);
  });

  it('should read a missing source as empty', () => {
    expect(buildFormGroup(fields, null)).toBeInstanceOf(FormRecord);
    expect(buildFormGroup(fields, ['array']).get('title')?.value).toBe('');
  });

  it('should fall back to an empty choice when a choice has no options', () => {
    const empty = buildControl({ key: 'x', label: 'X', kind: FieldKind.Choice, options: [] }, 'y');

    expect(empty.value).toBe('');
  });
});
