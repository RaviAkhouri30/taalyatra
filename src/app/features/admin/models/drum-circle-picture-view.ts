import { type DocumentFields } from '@core/interfaces/i-document-store';
import { fieldOf } from '../forms/json-node';
import { type ISectionView } from './i-editor-section';

/** The one picture field the editor shows for the drum circle section. */
export const DRUM_CIRCLE_PICTURE_FIELD = 'picture';

/**
 * Shows the drum circle's stored `gallery` list as one picture (0015 V16): the section now shows
 * only its first picture. The stored shape stays a list, so the site and `firestore.rules` don't
 * change; the other stored pictures are dropped on the first save.
 */
export const DRUM_CIRCLE_PICTURE_VIEW: ISectionView = {
  read(stored) {
    const gallery = fieldOf(stored, 'gallery');
    const first: unknown = Array.isArray(gallery) ? gallery[0] : undefined;
    return first === undefined ? {} : { [DRUM_CIRCLE_PICTURE_FIELD]: first };
  },
  write(stored, edited): DocumentFields {
    return { ...stored, gallery: [fieldOf(edited, DRUM_CIRCLE_PICTURE_FIELD)] };
  },
};
