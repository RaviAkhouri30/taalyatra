import { FieldKind } from '../models/field-kind.enum';
import {
  type IGroupFieldSchema,
  type IListFieldSchema,
  type IToggleFieldSchema,
} from '../models/i-field-schema';

/** The stored key of an item the owner has taken off the site (2.15.0). */
export const HIDDEN_KEY = 'hidden';

/** The switch on each item of a hideable list. Off unless turned on: a new item shows. */
export const HIDDEN_FIELD: IToggleFieldSchema = {
  key: HIDDEN_KEY,
  label: 'Hidden',
  kind: FieldKind.Toggle,
  offByDefault: true,
  hint: 'Kept here, but not shown on the site. Visitors don’t see it, but it isn’t secret: delete it to remove it.',
};

/**
 * @param list A list of groups.
 * @returns The same list with a Hidden switch on each item, last, and its hidden items marked
 *   (0028 D4, 2.15.0).
 */
export function hideable(
  list: IListFieldSchema & { readonly item: IGroupFieldSchema },
): IListFieldSchema {
  return {
    ...list,
    hideable: true,
    item: { ...list.item, fields: [...list.item.fields, HIDDEN_FIELD] },
  };
}
