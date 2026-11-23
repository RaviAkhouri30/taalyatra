import { Festival } from '@shared/enums/festival.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema, type IChoiceFieldSchema } from '../models/i-field-schema';
import { OFFER_SECTIONS } from './offer.sections';

/** @returns The field with `key` among `fields`, searching inside groups. */
function find(fields: readonly FieldSchema[], key: string): FieldSchema | undefined {
  for (const field of fields) {
    if (field.key === key) return field;
    const inner = field.kind === FieldKind.Group ? find(field.fields, key) : undefined;
    if (inner) return inner;
  }
  return undefined;
}

describe('OFFER_SECTIONS', () => {
  const [promotion, offer] = OFFER_SECTIONS;

  it('should offer every festival with the dates, Diwali first, each with its season (2.16.0)', () => {
    const festival = find(promotion?.fields ?? [], 'festival') as IChoiceFieldSchema;

    expect(festival.kind).toBe(FieldKind.Choice);
    expect(festival.options.map((option) => option.value)).toEqual(Object.values(Festival));
    expect(festival.options[1]?.label).toBe('Holi · March');
  });

  it('should no longer ask for the offer section’s own animation', () => {
    expect(find(offer?.fields ?? [], 'theme')).toBeUndefined();
  });
});
