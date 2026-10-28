/**
 * Field that holds a list section stored as one document (`home/marquee` → `{ _items: [...] }`).
 * Not `items`: `home/experiences` and `home/faq` have a real `items` field (ADR-0009).
 */
export const FIRESTORE_LIST_FIELD = '_items';

/** Position of a list item document in its collection; read order, removed from bodies. */
export const FIRESTORE_ORDER_FIELD = 'order';

/** Server timestamp the adapter stamps on every created document (rules require it). */
export const FIRESTORE_CREATED_AT_FIELD = 'createdAt';
