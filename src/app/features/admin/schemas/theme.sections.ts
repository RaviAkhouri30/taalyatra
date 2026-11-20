import {
  DEFAULT_THEME_COLOURS,
  THEME_FONT_PAIRS,
  type ThemeColours,
} from '@shared/constants/theme.constants';
import { ThemeBackdrop } from '@shared/enums/theme-backdrop.enum';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { ThemeHeadingWeight } from '@shared/enums/theme-heading-weight.enum';
import { ThemeTextSize } from '@shared/enums/theme-text-size.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema } from '../models/i-field-schema';
import { SectionPanel } from '../models/section-panel.enum';
import { THEME_FORM_KEYS, storedTheme } from '../models/theme-form';

const D = DEFAULT_THEME_COLOURS;

/** Each colour's label, what it colours on the site, and today's value. */
const COLOURS: readonly (readonly [keyof ThemeColours, string, string, string])[] = [
  [ThemeColour.Background, 'Background', 'Behind every page.', D.background],
  [ThemeColour.Cards, 'Cards', 'Cards, panels and alternate sections.', D.cards],
  [ThemeColour.Text, 'Text', 'Headings and body text.', D.text],
  [ThemeColour.QuietText, 'Quiet text', 'Descriptions, notes and fine print.', D.quietText],
  [ThemeColour.Accent, 'Accent', 'Buttons, links and highlights.', D.accent],
  [
    ThemeColour.SecondAccent,
    'Second accent',
    'The offer’s glow, tags and details.',
    D.secondAccent,
  ],
];

function colourField([key, label, hint, defaultValue]: (typeof COLOURS)[number]): FieldSchema {
  return { kind: FieldKind.Colour, key, label, hint, required: true, defaultValue };
}

/**
 * The Theme page's card (0021). One card, so the swatches, the contrast results and Reset reach
 * every field. Each choice lists today's value first: an empty document shows (and saves) it.
 */
export const THEME_SECTION: IEditorSection = {
  id: 'theme',
  title: 'Theme',
  path: ContentPath.SiteTheme,
  // The whole site changes, so the preview stays at the top of the home page.
  anchor: PageAnchor.Top,
  fields: [
    ...COLOURS.map(colourField),
    {
      kind: FieldKind.Choice,
      key: THEME_FORM_KEYS.backdrop,
      label: 'Page background',
      options: [
        { value: ThemeBackdrop.Plain, label: 'The background colour' },
        {
          value: ThemeBackdrop.Gradient,
          label: 'A soft gradient from the background to the cards',
        },
      ],
    },
    {
      kind: FieldKind.Choice,
      key: THEME_FORM_KEYS.textSize,
      label: 'Text size',
      hint: 'For the whole site. Larger text can wrap headings onto another line.',
      options: [
        { value: ThemeTextSize.Standard, label: 'Standard' },
        { value: ThemeTextSize.Smaller, label: 'Smaller' },
        { value: ThemeTextSize.Larger, label: 'Larger' },
      ],
    },
    {
      kind: FieldKind.Choice,
      key: THEME_FORM_KEYS.headingWeight,
      label: 'Headings',
      options: [
        { value: ThemeHeadingWeight.ExtraBold, label: 'Extra bold' },
        { value: ThemeHeadingWeight.Bold, label: 'Bold' },
      ],
    },
    {
      kind: FieldKind.Choice,
      key: THEME_FORM_KEYS.fonts,
      label: 'Fonts',
      hint: 'Headings, then body text. The preview shows them on the site.',
      options: THEME_FONT_PAIRS.map((pair) => ({ value: pair.fonts, label: pair.label })),
    },
  ],
  view: {
    // `preset` isn't edited: it's worked out from the colours when the theme is stored.
    read: (stored) =>
      Object.fromEntries(
        Object.entries(typeof stored === 'object' && stored !== null ? stored : {}).filter(
          ([key]) => key !== 'preset',
        ),
      ),
    write: (_stored, edited) => storedTheme(edited),
  },
  panels: [
    { panel: SectionPanel.ThemePresets, after: null },
    { panel: SectionPanel.ThemeContrast, after: ThemeColour.SecondAccent },
    { panel: SectionPanel.ThemeReset, after: THEME_FORM_KEYS.fonts },
  ],
};
