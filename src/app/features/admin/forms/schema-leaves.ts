import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema } from '../models/i-field-schema';
import { fieldOf } from './json-node';

/** One value the owner types or picks, with a label that says where it is. */
export interface ISchemaLeaf {
  /** E.g. "Offer card 2 · Card title". */
  readonly label: string;
  /** The field that edits it (never a group or a list). */
  readonly field: FieldSchema;
  /** Its stored value. */
  readonly value: unknown;
}

function within(prefix: string, label: string): string {
  return prefix ? `${prefix} · ${label}` : label;
}

/**
 * Flattens a document into the values its schema edits, entering groups and list items, so
 * checks can name each value the way the owner sees it.
 *
 * @param fields The fields edited.
 * @param source The stored document (or nested object).
 * @param prefix Label of the list item being entered, if any.
 * @returns Every edited value, in form order.
 */
export function schemaLeaves(
  fields: readonly FieldSchema[],
  source: unknown,
  prefix = '',
): ISchemaLeaf[] {
  return fields.flatMap((field): ISchemaLeaf[] => {
    const value = fieldOf(source, field.key);
    if (field.kind === FieldKind.Group) {
      // Groups mirror nested storage; the owner sees their fields directly, so no label part.
      return schemaLeaves(field.fields, value, prefix);
    }
    if (field.kind === FieldKind.List) {
      const { item } = field;
      return (Array.isArray(value) ? value : []).flatMap((entry: unknown, index) => {
        const label = within(prefix, `${item.label} ${String(index + 1)}`);
        return item.kind === FieldKind.Group
          ? schemaLeaves(item.fields, entry, label)
          : [{ label, field: item, value: entry }];
      });
    }
    return [{ label: within(prefix, field.label), field, value }];
  });
}
