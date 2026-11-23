import { HOME_MAX_LENGTH } from '@shared/constants/home-content-limits.constants';
import { FieldKind } from '../models/field-kind.enum';
import {
  type FieldSchema,
  type IChoiceFieldSchema,
  type IGroupFieldSchema,
  type IListFieldSchema,
} from '../models/i-field-schema';
import { multiline, text } from './schema-fields';

/** The icons a home card may show, from those the site has (0028); an unknown one shows the sparkle. */
export const HOME_ICON_FIELD: IChoiceFieldSchema = {
  key: 'icon',
  label: 'Icon',
  kind: FieldKind.Choice,
  options: [
    { value: 'sparkle', label: 'Sparkle' },
    { value: 'djembe', label: 'Djembe' },
    { value: 'group', label: 'People' },
    { value: 'home', label: 'Home' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'building', label: 'Building' },
    { value: 'star', label: 'Star' },
    { value: 'mic', label: 'Microphone' },
    { value: 'guitar', label: 'Guitar' },
    { value: 'procession', label: 'Procession' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'clock', label: 'Clock' },
    { value: 'map-pin', label: 'Map pin' },
    { value: 'chat-bubble', label: 'Speech bubble' },
  ],
};

/**
 * @param key The stored key of the list.
 * @param names The list's label, the button's label and one item's label.
 * @param maxItems The most items it holds.
 * @param fields One item's fields.
 * @returns A list of groups, e.g. the FAQ's questions.
 */
export function groupList(
  key: string,
  [label, addLabel, itemLabel]: readonly [string, string, string],
  maxItems: number,
  fields: readonly FieldSchema[],
): IListFieldSchema & { readonly item: IGroupFieldSchema } {
  const item: IGroupFieldSchema = { key: 'item', label: itemLabel, kind: FieldKind.Group, fields };
  return { key, label, kind: FieldKind.List, addLabel, maxItems, item };
}

/** A card's title, required. */
export const CARD_TITLE = text('title', 'Title', {
  required: true,
  maxLength: HOME_MAX_LENGTH.cardTitle,
});

/** A card's text. */
export const CARD_TEXT = multiline('text', 'Text', { maxLength: HOME_MAX_LENGTH.cardText });

/** A numbered item's number, e.g. "01". */
export const ITEM_NUMBER = text('number', 'Number', {
  maxLength: HOME_MAX_LENGTH.number,
  hint: 'Shown above the title, e.g. 01.',
});

/** The small heading above a list's title, e.g. "Our goals". */
export const LIST_EYEBROW = text('eyebrow', 'Small heading', { maxLength: HOME_MAX_LENGTH.label });

/** A list's own title. */
export const LIST_TITLE = text('title', 'Title', { maxLength: HOME_MAX_LENGTH.cardTitle });
