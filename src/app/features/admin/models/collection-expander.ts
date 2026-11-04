import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentFields, type DocumentWrite } from '@core/interfaces/i-document-store';
import { ContentPath } from './content-path.enum';

/** Where a collection's draft keeps its items; the same envelope as a list section. */
export const COLLECTION_ITEMS_FIELD = '_items';

/** Stored on each numbered document to keep the list's order. Never part of a draft. */
const ORDER_FIELD = 'order';

/** The ids run 001, 002…, as the seed script numbers them. */
const ID_DIGITS = 3;

const COLLECTIONS: ReadonlySet<string> = new Set<string>([
  ContentPath.Gallery,
  ContentPath.Team,
  ContentPath.ShowFormats,
  ContentPath.Videos,
]);

function isFields(value: unknown): value is DocumentFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function orderOf(fields: DocumentFields): number {
  const order = new Map(Object.entries(fields)).get(ORDER_FIELD);
  return typeof order === 'number' ? order : 0;
}

/**
 * @param path A stored path.
 * @returns Whether it's a collection of numbered documents, which the editor treats as one list.
 */
export function isCollection(path: string): boolean {
  return COLLECTIONS.has(path);
}

/**
 * A collection is stored as numbered documents with an `order`, and drafted as one document holding
 * a list (D15, D16), so autosave, reordering, publish checks, preview and undo all work on it as on
 * any document.
 *
 * @param documents The collection's stored documents, by id.
 * @returns One document holding them as a list, in order and without their `order`.
 */
export function collapseCollection(documents: ReadonlyMap<string, DocumentFields>): DocumentFields {
  const items = [...documents.values()]
    .sort((first, second) => orderOf(first) - orderOf(second))
    .map((fields) =>
      Object.fromEntries(Object.entries(fields).filter(([key]) => key !== ORDER_FIELD)),
    );
  return { [COLLECTION_ITEMS_FIELD]: items };
}

/**
 * @param path The collection.
 * @param content Its draft, holding the list.
 * @param existingIds The ids stored now, so numbers no longer used can be deleted.
 * @returns The writes that make the stored collection match the list.
 */
export function expandCollection(
  path: string,
  content: DocumentFields,
  existingIds: readonly string[],
): DocumentWrite[] {
  const stored: unknown = new Map(Object.entries(content)).get(COLLECTION_ITEMS_FIELD);
  const items = (Array.isArray(stored) ? stored : []).filter(isFields);
  const numbered = items.map((item, index) => ({
    id: String(index + 1).padStart(ID_DIGITS, '0'),
    fields: { ...item, [ORDER_FIELD]: index },
  }));
  const used = new Set(numbered.map(({ id }) => id));
  return [
    ...numbered.map(({ id, fields }): DocumentWrite => ({
      kind: DocumentWriteKind.Set,
      path: `${path}/${id}`,
      fields,
    })),
    ...existingIds
      .filter((id) => !used.has(id))
      .map((id): DocumentWrite => ({ kind: DocumentWriteKind.Delete, path: `${path}/${id}` })),
  ];
}
