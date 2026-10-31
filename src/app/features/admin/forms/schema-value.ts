import { type DocumentFields } from '@core/interfaces/i-document-store';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema } from '../models/i-field-schema';
import { entriesOf } from './json-node';

/*
 * Turns an editor form's raw value back into stored values, and merges them into a document
 * without touching the fields the editor doesn't cover (`firestore.rules` requires the stored
 * shape to stay the same).
 */

/**
 * @param fields The fields edited.
 * @param raw The form's raw value.
 * @returns The stored values, by key (an empty date is stored as `null`).
 */
export function readSchemaValue(fields: readonly FieldSchema[], raw: unknown): DocumentFields {
  const values = entriesOf(raw);
  return Object.fromEntries(
    fields.map((field) => [field.key, readField(field, values.get(field.key))]),
  );
}

/**
 * @param document The stored document (or nested object).
 * @param fields The fields edited.
 * @param values The values read from the form.
 * @returns A copy of the document with the edited fields replaced; groups merge recursively.
 */
export function mergeSchemaValue(
  document: unknown,
  fields: readonly FieldSchema[],
  values: DocumentFields,
): DocumentFields {
  const merged = entriesOf(document);
  const edited = entriesOf(values);
  for (const field of fields) {
    const value = edited.get(field.key);
    merged.set(
      field.key,
      field.kind === FieldKind.Group
        ? mergeSchemaValue(
            merged.get(field.key),
            field.fields,
            Object.fromEntries(entriesOf(value)),
          )
        : value,
    );
  }
  return Object.fromEntries(merged);
}

function readField(field: FieldSchema, raw: unknown): unknown {
  switch (field.kind) {
    case FieldKind.Group:
      return readSchemaValue(field.fields, raw);
    case FieldKind.List:
      return (Array.isArray(raw) ? raw : []).map((item: unknown) => readField(field.item, item));
    case FieldKind.Date:
      return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
    default:
      return raw;
  }
}
