import { type DocumentFields } from '@core/interfaces/i-document-store';
import { fieldOf } from '../forms/json-node';
import { COLLECTION_ITEMS_FIELD } from './collection-expander';
import { type ISectionView } from './i-editor-section';

/** Each photo's picture, in the editor's item (2.15.0). */
export const GALLERY_PHOTO_FIELD = 'photo';

/** @returns A list's items, or none. */
function itemsOf(value: unknown): readonly unknown[] {
  const items = fieldOf(value, COLLECTION_ITEMS_FIELD);
  return Array.isArray(items) ? items : [];
}

/**
 * Shows each gallery photo as a small group, its picture and its Hidden switch (2.15.0), while the
 * stored item stays the picture itself, with `hidden: true` only when it's hidden. So the site, the
 * photo library's "where it's used", backups and the rules see the same shape as before.
 */
export const GALLERY_VIEW: ISectionView = {
  read(stored) {
    return {
      [COLLECTION_ITEMS_FIELD]: itemsOf(stored).map((item) => {
        const { hidden, ...photo } = item as DocumentFields;
        return { [GALLERY_PHOTO_FIELD]: photo, hidden: hidden === true };
      }),
    };
  },
  write(stored, edited): DocumentFields {
    return {
      ...stored,
      [COLLECTION_ITEMS_FIELD]: itemsOf(edited).map((item) => {
        const photo = fieldOf(item, GALLERY_PHOTO_FIELD) as DocumentFields;
        return fieldOf(item, 'hidden') === true ? { ...photo, hidden: true } : photo;
      }),
    };
  },
};
