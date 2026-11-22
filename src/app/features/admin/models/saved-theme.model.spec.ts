import { DEFAULT_THEME_COLOURS } from '@shared/constants/theme.constants';
import {
  SAVED_THEME_DOCUMENT,
  SAVED_THEME_ID,
  SAVED_THEME_VALUES,
} from '../testing/saved-theme.fixture';
import { SavedTheme, nameKey } from './saved-theme.model';

describe('SavedTheme', () => {
  describe('from', () => {
    it('should read the name, time and every field of the theme when the document is whole', () => {
      const theme = SavedTheme.from(SAVED_THEME_ID, SAVED_THEME_DOCUMENT);

      expect(theme?.name).toBe('Spring show');
      expect(theme?.savedAt).toBe('2026-11-22T08:00:00.000Z');
      expect(theme?.values).toEqual(SAVED_THEME_VALUES);
    });

    it('should ignore fields the page doesn’t edit when the theme has them', () => {
      const theme = SavedTheme.from(SAVED_THEME_ID, {
        ...SAVED_THEME_DOCUMENT,
        theme: { ...SAVED_THEME_VALUES, preset: 'custom', logo: 'big', cards: 3 },
      });

      expect(Object.keys(theme?.values ?? {})).not.toContain('preset');
      expect(Object.keys(theme?.values ?? {})).not.toContain('logo');
      expect(Object.keys(theme?.values ?? {})).not.toContain('cards');
    });

    it.each([
      ['an id that isn’t a UUID', 'spring', SAVED_THEME_DOCUMENT],
      ['no document', SAVED_THEME_ID, null],
      ['a blank name', SAVED_THEME_ID, { ...SAVED_THEME_DOCUMENT, name: '  ' }],
      ['a long name', SAVED_THEME_ID, { ...SAVED_THEME_DOCUMENT, name: 'x'.repeat(41) }],
      ['no time', SAVED_THEME_ID, { ...SAVED_THEME_DOCUMENT, savedAt: 3 }],
      ['no theme', SAVED_THEME_ID, { ...SAVED_THEME_DOCUMENT, theme: 'monsoon' }],
    ])('should leave it out when it has %s', (_case, id, stored) => {
      expect(SavedTheme.from(id, stored)).toBeNull();
    });
  });

  it('should trim the name and keep only the page’s fields when created from the form', () => {
    const theme = SavedTheme.create(SAVED_THEME_ID, '  Spring show ', 'now', {
      ...SAVED_THEME_VALUES,
      accent: '#FF0000',
      preset: 'custom',
    });

    expect(theme.name).toBe('Spring show');
    expect(theme.values).toEqual(SAVED_THEME_VALUES);
    expect(theme.toDocument()).toEqual({
      name: 'Spring show',
      savedAt: 'now',
      theme: SAVED_THEME_VALUES,
    });
  });

  it('should match the form only when every field is the theme’s', () => {
    const theme = SavedTheme.create(SAVED_THEME_ID, 'Spring show', 'now', SAVED_THEME_VALUES);

    expect(theme.matches({ ...SAVED_THEME_VALUES, accent: '#FF0000' })).toBe(true);
    expect(theme.matches({ ...SAVED_THEME_VALUES, fonts: 'bricolage-dm' })).toBe(false);
  });

  it('should never match when it holds no fields', () => {
    const theme = SavedTheme.from(SAVED_THEME_ID, { ...SAVED_THEME_DOCUMENT, theme: {} });

    expect(theme?.matches(SAVED_THEME_VALUES)).toBe(false);
  });

  it('should give its colours for the swatch, today’s for any it lacks', () => {
    const theme = SavedTheme.from(SAVED_THEME_ID, {
      ...SAVED_THEME_DOCUMENT,
      theme: { accent: '#ff0000' },
    });

    expect(theme?.colours).toEqual({ ...DEFAULT_THEME_COLOURS, accent: '#ff0000' });
  });

  it('should keep its id, time and theme when renamed', () => {
    const theme = SavedTheme.create(SAVED_THEME_ID, 'Spring show', 'now', SAVED_THEME_VALUES);

    const renamed = theme.renamed(' Summer show ');

    expect(renamed).toMatchObject({ id: SAVED_THEME_ID, name: 'Summer show', savedAt: 'now' });
    expect(renamed.values).toBe(theme.values);
  });

  it('should compare names without case or extra spaces when keyed', () => {
    expect(nameKey('  Spring   Show ')).toBe('spring show');
  });
});
