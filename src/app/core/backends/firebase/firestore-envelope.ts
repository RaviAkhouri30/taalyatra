import { FIRESTORE_LIST_FIELD, FIRESTORE_ORDER_FIELD } from './firestore.constants';

/** Fields of a Firestore document, as plain data. */
export type FirestoreFields = Readonly<Record<string, unknown>>;

/**
 * Restores a list section that is stored as `{ _items: [...] }` (Firestore documents can't be
 * bare arrays). Any other document is returned unchanged.
 * @param fields The stored document.
 * @returns The list, or `fields` itself.
 */
export function unwrapListSection(fields: FirestoreFields): unknown {
  const list: unknown = new Map(Object.entries(fields)).get(FIRESTORE_LIST_FIELD);
  return Array.isArray(list) ? list : fields;
}

/**
 * Removes the storage-only `order` field from a list item, so the body matches its DTO.
 * @param fields The stored list item.
 * @returns A copy without `order`.
 */
export function withoutOrder(fields: FirestoreFields): FirestoreFields {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => key !== FIRESTORE_ORDER_FIELD),
  );
}

/**
 * @param value A request body.
 * @returns Whether `value` can be stored as a document (a plain object, not an array).
 */
export function isFirestoreFields(value: unknown): value is FirestoreFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
