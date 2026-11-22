import { FieldKind } from '../models/field-kind.enum';
import { PAGE_CTA_FIELD, PAGE_HERO_FIELD, group } from './page-parts';
import { text } from './schema-fields';

describe('inner page schema parts', () => {
  it('should edit every part of a page’s heading', () => {
    expect(PAGE_HERO_FIELD.fields.map((field) => field.key)).toEqual([
      'eyebrow',
      'title',
      'highlight',
      'lead',
    ]);
  });

  it('should edit every part of a page’s closing call to action', () => {
    expect(PAGE_CTA_FIELD.fields.map((field) => field.key)).toEqual([
      'title',
      'text',
      'primary',
      'secondary',
    ]);
  });

  it('should make a group of fields stored together when given a key and fields', () => {
    expect(group('labels', 'Labels', [text('a', 'A')])).toMatchObject({
      key: 'labels',
      label: 'Labels',
      kind: FieldKind.Group,
    });
  });
});
