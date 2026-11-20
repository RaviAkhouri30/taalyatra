import { THEME_PRESETS } from '@shared/constants/theme.constants';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { RESET_VALUES, presetOf, presetValues, storedTheme, themeOfForm } from './theme-form';

const FESTIVAL = THEME_PRESETS.find((preset) => preset.preset === ThemePreset.Festival)!;

describe('theme form', () => {
  it('should recognise a ready-made theme when the form holds its colours and background', () => {
    expect(presetOf(presetValues(FESTIVAL))).toBe(ThemePreset.Festival);
  });

  it('should recognise it whatever case the colours were typed in', () => {
    const upper = { ...presetValues(FESTIVAL), accent: FESTIVAL.colours.accent.toUpperCase() };

    expect(presetOf(upper)).toBe(ThemePreset.Festival);
  });

  it('should call it custom once a colour differs', () => {
    expect(presetOf({ ...presetValues(FESTIVAL), accent: '#123456' })).toBe(ThemePreset.Custom);
  });

  it('should call it custom once the background style differs', () => {
    expect(presetOf({ ...presetValues(FESTIVAL), backdrop: 'plain' })).toBe(ThemePreset.Custom);
  });

  it('should store colours in lower case with the theme they match', () => {
    expect(storedTheme({ ...RESET_VALUES, accent: '#E9A552' })).toEqual({
      ...RESET_VALUES,
      accent: '#e9a552',
      preset: ThemePreset.WarmNight,
    });
  });

  it('should make today’s look when given Reset’s values', () => {
    expect(themeOfForm(RESET_VALUES).variables().size).toBe(0);
  });
});
