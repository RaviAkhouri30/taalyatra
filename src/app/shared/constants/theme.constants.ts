import { ThemeFonts } from '@shared/enums/theme-fonts.enum';
import { ThemeHeadingWeight } from '@shared/enums/theme-heading-weight.enum';
import { ThemeTextSize } from '@shared/enums/theme-text-size.enum';
import { DEFAULT_BACKGROUND } from './theme-default.constants';

/** A theme's six colours, as `#rrggbb`; the keys are `ThemeColour`'s values. */
export interface ThemeColours {
  readonly background: string;
  readonly cards: string;
  readonly text: string;
  readonly quietText: string;
  readonly accent: string;
  readonly secondAccent: string;
}

/** Today's six colours: the design's (`_tokens.scss`), and Warm night's. */
export const DEFAULT_THEME_COLOURS: ThemeColours = {
  background: DEFAULT_BACKGROUND,
  cards: '#241c17',
  text: '#efe6d9',
  quietText: '#c6b8a6',
  accent: '#e9a552',
  secondAccent: '#c96b3c',
};

/** A font pair: its name, the CSS font stacks, and the stylesheet that loads it. */
export interface IThemeFontPair {
  readonly fonts: ThemeFonts;
  readonly label: string;
  /** Headings: the web font, then its sized fallback (`_fonts.scss`). */
  readonly display: string;
  /** Body text, likewise. */
  readonly body: string;
  /**
   * Google Fonts' stylesheet, then the fallbacks sized to match (`public/fonts/`); none for today's
   * pair, which `index.html` and `_fonts.scss` already load.
   */
  readonly stylesheets: readonly string[];
}

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?';
/** The pairs' sized fallbacks, served from `public/fonts/`. */
const FALLBACKS = 'fonts/';

/** Today's pair, which `index.html` already loads. */
export const DEFAULT_FONT_PAIR: IThemeFontPair = {
  fonts: ThemeFonts.BricolageDm,
  label: 'Bricolage Grotesque and DM Sans (warm and modern)',
  display: "'Bricolage Grotesque', 'Bricolage Grotesque Fallback', sans-serif",
  body: "'DM Sans', 'DM Sans Fallback', sans-serif",
  stylesheets: [],
};

/** The font pairs in the order the Theme page offers them. */
export const THEME_FONT_PAIRS: readonly IThemeFontPair[] = [
  DEFAULT_FONT_PAIR,
  {
    fonts: ThemeFonts.FrauncesInter,
    label: 'Fraunces and Inter (classic, with a serif)',
    display: "'Fraunces', 'Fraunces Fallback', serif",
    body: "'Inter', 'Inter Fallback', sans-serif",
    stylesheets: [
      `${GOOGLE_FONTS}family=Fraunces:wght@500;700;800&family=Inter:wght@400;500;700&display=swap`,
      `${FALLBACKS}fraunces-inter.css`,
    ],
  },
  {
    fonts: ThemeFonts.PlayfairSource,
    label: 'Playfair Display and Source Sans 3 (elegant)',
    display: "'Playfair Display', 'Playfair Display Fallback', serif",
    body: "'Source Sans 3', 'Source Sans 3 Fallback', sans-serif",
    stylesheets: [
      `${GOOGLE_FONTS}family=Playfair+Display:wght@500;700;800&family=Source+Sans+3:wght@400;500;700&display=swap`,
      `${FALLBACKS}playfair-source.css`,
    ],
  },
  {
    fonts: ThemeFonts.PoppinsNunito,
    label: 'Poppins and Nunito Sans (rounded and friendly)',
    display: "'Poppins', 'Poppins Fallback', sans-serif",
    body: "'Nunito Sans', 'Nunito Sans Fallback', sans-serif",
    stylesheets: [
      `${GOOGLE_FONTS}family=Poppins:wght@500;700;800&family=Nunito+Sans:wght@400;500;700&display=swap`,
      `${FALLBACKS}poppins-nunito.css`,
    ],
  },
  {
    fonts: ThemeFonts.SpaceWork,
    label: 'Space Grotesk and Work Sans (clean)',
    display: "'Space Grotesk', 'Space Grotesk Fallback', sans-serif",
    body: "'Work Sans', 'Work Sans Fallback', sans-serif",
    stylesheets: [
      `${GOOGLE_FONTS}family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;500;700&display=swap`,
      `${FALLBACKS}space-work.css`,
    ],
  },
  {
    fonts: ThemeFonts.YatraMukta,
    label: 'Yatra One and Mukta (Indian lettering)',
    display: "'Yatra One', 'Yatra One Fallback', sans-serif",
    body: "'Mukta', 'Mukta Fallback', sans-serif",
    stylesheets: [
      `${GOOGLE_FONTS}family=Yatra+One&family=Mukta:wght@400;500;700&display=swap`,
      `${FALLBACKS}yatra-mukta.css`,
    ],
  },
];

/** How much each text size scales every font size by. */
export const THEME_TEXT_SCALES: ReadonlyMap<string, number> = new Map(
  Object.entries({
    [ThemeTextSize.Smaller]: 0.94,
    [ThemeTextSize.Standard]: 1,
    [ThemeTextSize.Larger]: 1.1,
  }),
);

/** The CSS weight of each heading weight. */
export const THEME_HEADING_WEIGHTS: ReadonlyMap<string, number> = new Map(
  Object.entries({
    [ThemeHeadingWeight.Bold]: 700,
    [ThemeHeadingWeight.ExtraBold]: 800,
  }),
);

/** WCAG 2.2 AA's contrast for normal text (1.4.3). */
export const TEXT_CONTRAST = 4.5;

/** WCAG 2.2 AA's contrast for a component's edge, such as a field's (1.4.11). */
export const UI_CONTRAST = 3;

/** The prefix of the themed CSS variables (`_theme.scss`). */
export const THEME_VARIABLE_PREFIX = '--ty-';
