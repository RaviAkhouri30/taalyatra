import { type DocumentFields } from '@core/interfaces/i-document-store';
import { DEFAULT_THEME_COLOURS } from '@shared/constants/theme.constants';

/** A saved theme's id, as the page makes them (0027). */
export const SAVED_THEME_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

/** Its document's path. */
export const SAVED_THEME_PATH = `savedThemes/${SAVED_THEME_ID}`;

/** A saved theme's form values: today's colours with a red accent, and other fonts. */
export const SAVED_THEME_VALUES: DocumentFields = {
  ...DEFAULT_THEME_COLOURS,
  accent: '#ff0000',
  backdrop: 'plain',
  textSize: 'standard',
  headingWeight: 'extra-bold',
  fonts: 'space-work',
};

/** Its stored document. */
export const SAVED_THEME_DOCUMENT: DocumentFields = {
  name: 'Spring show',
  savedAt: '2026-11-22T08:00:00.000Z',
  theme: SAVED_THEME_VALUES,
};
