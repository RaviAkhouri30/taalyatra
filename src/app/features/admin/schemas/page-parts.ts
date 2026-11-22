import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { PAGE_MAX_LENGTH } from '@shared/constants/page-content-limits.constants';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema, type IGroupFieldSchema } from '../models/i-field-schema';
import { HEADING_FIELDS, buttonLabel, multiline, text } from './schema-fields';

const { eyebrow, title, lead } = HEADING_FIELDS;

/**
 * @param key The stored key.
 * @param label The group's label.
 * @param fields Its fields.
 * @returns A group of fields stored together, e.g. the page's heading.
 */
export function group(
  key: string,
  label: string,
  fields: readonly FieldSchema[],
): IGroupFieldSchema {
  return { key, label, kind: FieldKind.Group, fields };
}

/** An inner page's heading (`IPageHeroDto`): eyebrow, title, highlighted end and introduction. */
export const PAGE_HERO_FIELD = group('hero', 'Page heading', [
  eyebrow,
  { ...title, label: 'Title, first part', recommended: 40 },
  text('highlight', 'Title, highlighted end', {
    maxLength: CONTENT_MAX_LENGTH.highlight,
    recommended: 25,
    hint: 'Shown in the accent colour, after the first part.',
  }),
  lead,
]);

/** An inner page's closing call to action (`IPageCtaDto`). */
export const PAGE_CTA_FIELD = group('cta', 'Call to action at the end', [
  text('title', 'Title', { required: true, maxLength: PAGE_MAX_LENGTH.cardTitle }),
  multiline('text', 'Text', { maxLength: PAGE_MAX_LENGTH.cardText }),
  buttonLabel('primary', 'Main button'),
  buttonLabel('secondary', 'Second button'),
]);
