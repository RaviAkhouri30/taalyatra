import { ThemeBackdrop } from '@shared/enums/theme-backdrop.enum';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { DEFAULT_THEME_COLOURS, type ThemeColours } from './theme.constants';

/** A ready-made theme: its name, colours and background. */
export interface IThemePresetDefinition {
  readonly preset: ThemePreset;
  readonly label: string;
  readonly colours: ThemeColours;
  readonly backdrop: ThemeBackdrop;
}

/**
 * The ready-made themes in the order the Theme page offers them, within its Dark and Light groups;
 * each passes every check.
 */
export const THEME_PRESETS: readonly IThemePresetDefinition[] = [
  {
    preset: ThemePreset.WarmNight,
    label: 'Warm night',
    colours: DEFAULT_THEME_COLOURS,
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Daylight,
    label: 'Daylight',
    colours: {
      background: '#faf6f0',
      cards: '#ffffff',
      text: '#1f1915',
      quietText: '#5a4e45',
      accent: '#974912',
      secondAccent: '#2e6b57',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Festival,
    label: 'Festival',
    colours: {
      background: '#2b0d12',
      cards: '#3b141b',
      text: '#fff3e0',
      quietText: '#ecccb4',
      accent: '#ffb21e',
      secondAccent: '#ff6f91',
    },
    backdrop: ThemeBackdrop.Gradient,
  },
  {
    preset: ThemePreset.HighContrast,
    label: 'High contrast',
    colours: {
      background: '#000000',
      cards: '#121212',
      text: '#ffffff',
      quietText: '#e0e0e0',
      accent: '#ffd500',
      secondAccent: '#7fd4ff',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  // 0027 D1: each checked with the site's own contrast check, as the four above.
  {
    preset: ThemePreset.IndigoNight,
    label: 'Indigo night',
    colours: {
      background: '#12132b',
      cards: '#1d1f3f',
      text: '#eceaf7',
      quietText: '#b9b8d6',
      accent: '#f2b84b',
      secondAccent: '#8fa2ff',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Monsoon,
    label: 'Monsoon',
    colours: {
      background: '#0d2226',
      cards: '#15323a',
      text: '#e6f2f0',
      quietText: '#a9c9c4',
      accent: '#5fd3b8',
      secondAccent: '#f0a868',
    },
    backdrop: ThemeBackdrop.Gradient,
  },
  {
    preset: ThemePreset.Forest,
    label: 'Forest',
    colours: {
      background: '#121c14',
      cards: '#1b2a1e',
      text: '#ecf0e4',
      quietText: '#b5c2a8',
      accent: '#c9d66a',
      secondAccent: '#e09a5a',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Diwali,
    label: 'Diwali',
    colours: {
      background: '#1f0f2b',
      cards: '#2e1940',
      text: '#fbefe0',
      quietText: '#d9c2d6',
      accent: '#ffc247',
      secondAccent: '#ff8a5c',
    },
    backdrop: ThemeBackdrop.Gradient,
  },
  {
    preset: ThemePreset.Ocean,
    label: 'Ocean',
    colours: {
      background: '#0b1a2e',
      cards: '#13263f',
      text: '#e8f0f8',
      quietText: '#aec2d8',
      accent: '#ff8a6b',
      secondAccent: '#5cc8e0',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Charcoal,
    label: 'Charcoal',
    colours: {
      background: '#18191b',
      cards: '#232528',
      text: '#ededed',
      quietText: '#b8bcc2',
      accent: '#6cb4ff',
      secondAccent: '#c9a46a',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Marigold,
    label: 'Marigold',
    colours: {
      background: '#fff8ec',
      cards: '#ffffff',
      text: '#2a1a0c',
      quietText: '#5e4a36',
      accent: '#8f3f00',
      secondAccent: '#8a2b52',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Sandstone,
    label: 'Sandstone',
    colours: {
      background: '#f6efe4',
      cards: '#fffaf2',
      text: '#2b1f17',
      quietText: '#5f4f42',
      accent: '#9c3d1c',
      // Darker than first chosen: the contact note's tinted panel needs it (axe, 0027).
      secondAccent: '#2f5a3b',
    },
    backdrop: ThemeBackdrop.Gradient,
  },
  {
    preset: ThemePreset.Holi,
    label: 'Holi',
    colours: {
      background: '#ffffff',
      cards: '#faf5fb',
      text: '#1e1424',
      quietText: '#574a5e',
      accent: '#b0186a',
      secondAccent: '#00706b',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Mint,
    label: 'Mint',
    colours: {
      background: '#f1f8f4',
      cards: '#ffffff',
      text: '#10261c',
      quietText: '#45594f',
      accent: '#146b4a',
      secondAccent: '#8a4a12',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Rose,
    label: 'Rose',
    colours: {
      background: '#fdf3f3',
      cards: '#ffffff',
      text: '#2b1216',
      quietText: '#5f4448',
      accent: '#9e2340',
      secondAccent: '#6b4a8a',
    },
    backdrop: ThemeBackdrop.Plain,
  },
  {
    preset: ThemePreset.Slate,
    label: 'Slate',
    colours: {
      background: '#f3f5f8',
      cards: '#ffffff',
      text: '#141a24',
      quietText: '#4a5465',
      accent: '#1f4f99',
      secondAccent: '#8a3b12',
    },
    backdrop: ThemeBackdrop.Plain,
  },
];
