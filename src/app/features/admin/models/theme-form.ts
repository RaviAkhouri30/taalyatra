import { type DocumentFields } from '@core/interfaces/i-document-store';
import {
  THEME_PRESETS,
  type IThemePresetDefinition,
} from '@shared/constants/theme-presets.constants';
import { DEFAULT_FONT_PAIR, DEFAULT_THEME_COLOURS } from '@shared/constants/theme.constants';
import { ThemeBackdrop } from '@shared/enums/theme-backdrop.enum';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { ThemeHeadingWeight } from '@shared/enums/theme-heading-weight.enum';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { ThemeTextSize } from '@shared/enums/theme-text-size.enum';
import { SiteTheme } from '@shared/models/site-theme.model';

/** The stored fields the Theme page's form edits (all but `preset`, which is worked out). */
export const THEME_FORM_KEYS = {
  backdrop: 'backdrop',
  textSize: 'textSize',
  headingWeight: 'headingWeight',
  fonts: 'fonts',
} as const;

const COLOUR_KEYS: readonly string[] = Object.values(ThemeColour);

/**
 * @param edited The form's values.
 * @returns Them as stored: colours in lower case, as the rules require, everything else as it is.
 */
function normalised(edited: DocumentFields): DocumentFields {
  return Object.fromEntries(
    Object.entries(edited).map(([key, value]) => [
      key,
      COLOUR_KEYS.includes(key) && typeof value === 'string' ? value.toLowerCase() : value,
    ]),
  );
}

/**
 * @param preset A ready-made theme.
 * @param values The form's values, normalised.
 * @returns Whether they are that theme's colours and background.
 */
function isPreset(preset: IThemePresetDefinition, values: ReadonlyMap<string, unknown>): boolean {
  return (
    Object.entries(preset.colours).every(([key, colour]) => values.get(key) === colour) &&
    values.get(THEME_FORM_KEYS.backdrop) === preset.backdrop
  );
}

/**
 * @param edited The form's values.
 * @returns The ready-made theme they are, or `custom` once a colour or the background differs.
 */
export function presetOf(edited: DocumentFields): ThemePreset {
  const values = new Map(Object.entries(normalised(edited)));
  return THEME_PRESETS.find((preset) => isPreset(preset, values))?.preset ?? ThemePreset.Custom;
}

/**
 * @param edited The form's values.
 * @returns The document to store: normalised, with the ready-made theme they match.
 */
export function storedTheme(edited: DocumentFields): DocumentFields {
  return { ...normalised(edited), preset: presetOf(edited) };
}

/**
 * @param edited The form's values.
 * @returns Them as a saved theme keeps them (0027 D2): everything on the page, normalised, without
 *   `preset`, which is worked out again whenever the theme is stored.
 */
export function savedThemeValues(edited: DocumentFields): DocumentFields {
  return normalised(edited);
}

/**
 * @param edited The form's values.
 * @returns The theme they make, as the site would show it.
 */
export function themeOfForm(edited: DocumentFields): SiteTheme {
  return SiteTheme.from(storedTheme(edited));
}

/**
 * @param preset A ready-made theme.
 * @returns The form values that choose it: its colours and background (0021 design decision 4).
 */
export function presetValues(preset: IThemePresetDefinition): DocumentFields {
  return { ...preset.colours, [THEME_FORM_KEYS.backdrop]: preset.backdrop };
}

/** The form values of today's look, which Reset puts back. */
export const RESET_VALUES: DocumentFields = {
  ...DEFAULT_THEME_COLOURS,
  [THEME_FORM_KEYS.backdrop]: ThemeBackdrop.Plain,
  [THEME_FORM_KEYS.textSize]: ThemeTextSize.Standard,
  [THEME_FORM_KEYS.headingWeight]: ThemeHeadingWeight.ExtraBold,
  [THEME_FORM_KEYS.fonts]: DEFAULT_FONT_PAIR.fonts,
};
