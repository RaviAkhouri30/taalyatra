import { type ThemeColours } from '@shared/constants/theme.constants';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { TEXT_CONTRAST, UI_CONTRAST } from '@shared/constants/theme.constants';
import { awayFrom, contrast, isDark, mix } from '@shared/utils/colour.util';

const BLACK = '#000000';

/** The error colours on a dark background: today's. */
export const DARK_DANGER = {
  tint: 'rgb(193 18 31 / 14%)',
  /** The tint's opacity, for the contrast check. */
  tintOpacity: 0.14,
  line: '#8e2b20',
  text: '#f3b8a8',
} as const;

/** The error colours on a light background (0021 design decision 5). */
export const LIGHT_DANGER = {
  tint: 'rgb(193 18 31 / 10%)',
  /** The tint's opacity, for the contrast check. */
  tintOpacity: 0.1,
  line: '#b3261e',
  text: '#8e1b12',
} as const;

/** The error box's tint: a translucent red (its opacity is each set's `tintOpacity`). */
export const DANGER_TINT_RED = '#c1121f';

/** How much of the second colour each worked-out token mixes in (0 none, 1 all of it). */
const AMOUNT = {
  inkDeep: 0.22,
  inkLift: 0.55,
  surfaceRaised: 0.5,
  surfaceHigh: 0.05,
  surfaceMid: 0.85,
  panel: 0.4,
  panelRaised: 0.015,
  creamDim: 0.55,
  creamDeep: 0.1,
  mutedSoft: 0.1,
  mutedStrong: 0.17,
  mutedFaint: 0.25,
  mutedDim: 0.3,
  placeholder: 0.3,
  line: 0.1,
  edge: 0.18,
  fieldBorder: 0.5,
  bronze: 0.5,
  glow: 0.55,
  amberLight: 0.35,
  amberDeep: 0.4,
  amberSoft: 0.45,
  amberPale: 0.8,
  flare: 0.5,
  promoInk: 0.15,
  promoInkSoft: 0.3,
  promoInkDeep: 0.07,
  clayDeep: 0.3,
  sage: 0.3,
  sageLight: 0.4,
  sageSoft: 0.55,
  sagePale: 0.65,
  sageDeep: 0.3,
  paper: 0.6,
  paperAccent: 0.45,
  paperLine: 0.1,
  paperEdge: 0.3,
  paperText: 0.2,
  paperQuiet: 0.35,
  paperFaint: 0.5,
  ivory: 0.3,
} as const;

/** One themed colour token: the colours it comes from and how it's worked out from them. */
export interface IThemeToken {
  /** Its name in `$palette` (`_tokens.scss`) and its CSS variable, `--ty-<name>`. */
  readonly name: string;
  /** Today's value: `_tokens.scss`'s, which the tests compare. */
  readonly fallback: string;
  /** The theme colours it's worked out from: it's set only when one of them isn't today's. */
  readonly sources: readonly ThemeColour[];
  /**
   * @param c The theme's six colours.
   * @returns Its value for them.
   */
  readonly derive: (c: ThemeColours) => string;
}

const STEP = 0.01;
const { Background: BG, Cards: CARDS, Text: TEXT, QuietText: QUIET } = ThemeColour;
const { Accent: ACCENT, SecondAccent: SECOND } = ThemeColour;

/** Whether `colour` reaches `needs` against every ground. */
function readsOn(colour: string, grounds: readonly string[], needs: number): boolean {
  return grounds.every((ground) => contrast(colour, ground) >= needs);
}

/**
 * A shade that fades toward `toward` by up to `amount`, but never so far it stops reading on the
 * grounds: the design's softer text, which a theme mustn't make unreadable.
 */
function fadedButReadable(
  colour: string,
  toward: string,
  amount: number,
  [grounds, needs]: readonly [readonly string[], number],
): string {
  let share = amount;
  while (share > 0 && !readsOn(mix(colour, toward, share), grounds, needs)) {
    share -= STEP;
  }
  return mix(colour, toward, Math.max(share, 0));
}

/**
 * The least mix of `toward` into `colour`, from `amount` up, that reads on the grounds: an edge
 * that's as quiet as the design's, but still visible (0021 decision 1).
 */
function strongEnough(
  colour: string,
  toward: string,
  amount: number,
  [grounds, needs]: readonly [readonly string[], number],
): string {
  let share = amount;
  while (share < 1 && !readsOn(mix(colour, toward, share), grounds, needs)) {
    share += STEP;
  }
  return mix(colour, toward, Math.min(share, 1));
}

/** Of the background and text colours, the one that reads better on `colour`. */
function labelOn(c: ThemeColours, colour: string): string {
  return contrast(c.background, colour) >= contrast(c.text, colour) ? c.background : c.text;
}

/**
 * @param c The theme's colours.
 * @returns The error colours for its background.
 */
export function dangerSet(c: ThemeColours): typeof DARK_DANGER | typeof LIGHT_DANGER {
  return isDark(c.background) ? DARK_DANGER : LIGHT_DANGER;
}

/** Text on the page: readable on the background and on cards. */
function onPage(c: ThemeColours): readonly [readonly string[], number] {
  return [[c.background, c.cards], TEXT_CONTRAST];
}

/** A field's edge: visible on cards and on the background. */
function edgeOnPage(c: ThemeColours): readonly [readonly string[], number] {
  return [[c.background, c.cards], UI_CONTRAST];
}

/** The light sections' ground (`.light`): the text colour, a step further from the background. */
function ivory(c: ThemeColours): string {
  return mix(c.text, awayFrom(c.background), AMOUNT.ivory);
}

/** Quote and client cards on light sections: lighter still than their ground. */
function paper(c: ThemeColours): string {
  return mix(ivory(c), awayFrom(c.background), AMOUNT.paper);
}

function token(
  name: string,
  fallback: string,
  sources: readonly ThemeColour[],
  derive: (c: ThemeColours) => string,
): IThemeToken {
  return { name, fallback, sources, derive };
}

/** Every themed colour token, as listed in `_tokens.scss`. */
export const THEME_TOKENS: readonly IThemeToken[] = [
  // Background
  token('ink', '#171210', [BG], (c) => c.background),
  // Deeper means further from the text: darker on a dark page, lighter on a light one.
  token('ink-deep', '#120e0c', [BG, TEXT], (c) =>
    mix(c.background, awayFrom(c.text), AMOUNT.inkDeep),
  ),
  token('ink-lift', '#1e1714', [BG, CARDS], (c) => mix(c.background, c.cards, AMOUNT.inkLift)),
  // Cards
  token('surface', '#241c17', [CARDS], (c) => c.cards),
  token('surface-raised', '#1e1813', [BG, CARDS], (c) =>
    mix(c.background, c.cards, AMOUNT.surfaceRaised),
  ),
  token('surface-high', '#2e241d', [CARDS, TEXT], (c) => mix(c.cards, c.text, AMOUNT.surfaceHigh)),
  token('surface-mid', '#221a15', [BG, CARDS], (c) =>
    mix(c.background, c.cards, AMOUNT.surfaceMid),
  ),
  token('panel', '#1c1511', [BG, CARDS], (c) => mix(c.background, c.cards, AMOUNT.panel)),
  token('panel-raised', '#271e18', [CARDS, TEXT], (c) => mix(c.cards, c.text, AMOUNT.panelRaised)),
  // Text
  token('cream', '#efe6d9', [TEXT], (c) => c.text),
  token('cream-dim', '#d8c9b5', [TEXT, QUIET], (c) => mix(c.text, c.quietText, AMOUNT.creamDim)),
  token('cream-deep', '#efe3d0', [TEXT, QUIET], (c) => mix(c.text, c.quietText, AMOUNT.creamDeep)),
  token('ivory', '#f5ede1', [TEXT, BG], ivory),
  // Quiet text
  token('muted', '#c6b8a6', [QUIET], (c) => c.quietText),
  token('muted-soft', '#b4a491', [QUIET, BG], (c) =>
    mix(c.quietText, c.background, AMOUNT.mutedSoft),
  ),
  token('muted-strong', '#a89883', [QUIET, BG, CARDS], (c) =>
    fadedButReadable(c.quietText, c.background, AMOUNT.mutedStrong, onPage(c)),
  ),
  token('muted-faint', '#9a8c7b', [QUIET, BG, CARDS], (c) =>
    fadedButReadable(c.quietText, c.background, AMOUNT.mutedFaint, onPage(c)),
  ),
  token('muted-dim', '#8c7e6c', [QUIET, BG, CARDS], (c) =>
    fadedButReadable(c.quietText, c.background, AMOUNT.mutedDim, onPage(c)),
  ),
  token('placeholder', '#928474', [QUIET, BG, CARDS], (c) =>
    fadedButReadable(c.quietText, c.background, AMOUNT.placeholder, onPage(c)),
  ),
  // Lines
  token('line', '#3a2e25', [CARDS, TEXT], (c) => mix(c.cards, c.text, AMOUNT.line)),
  token('edge', '#4a3a2c', [CARDS, TEXT], (c) => mix(c.cards, c.text, AMOUNT.edge)),
  token('field-border', '#776758', [CARDS, QUIET, BG], (c) =>
    strongEnough(c.cards, c.quietText, AMOUNT.fieldBorder, edgeOnPage(c)),
  ),
  token('bronze', '#725f4d', [BG, QUIET], (c) =>
    strongEnough(c.background, c.quietText, AMOUNT.bronze, [[c.background], UI_CONTRAST]),
  ),
  token('glow', '#8a6a4e', [BG, ACCENT], (c) => mix(c.background, c.accent, AMOUNT.glow)),
  // Accent
  token('amber', '#e9a552', [ACCENT], (c) => c.accent),
  token('amber-light', '#f3c078', [ACCENT, BG], (c) =>
    mix(c.accent, awayFrom(c.background), AMOUNT.amberLight),
  ),
  token('amber-deep', '#de8c3f', [ACCENT, SECOND], (c) =>
    mix(c.accent, c.secondAccent, AMOUNT.amberDeep),
  ),
  token('amber-soft', '#ffd79a', [ACCENT, BG], (c) =>
    mix(c.accent, awayFrom(c.background), AMOUNT.amberSoft),
  ),
  token('amber-pale', '#fff0d2', [ACCENT, BG], (c) =>
    mix(c.accent, awayFrom(c.background), AMOUNT.amberPale),
  ),
  token('flare', '#fe7f2d', [ACCENT, SECOND], (c) => mix(c.accent, c.secondAccent, AMOUNT.flare)),
  token('promo-ink', '#3a2213', [ACCENT, BG, TEXT], (c) =>
    fadedButReadable(labelOn(c, c.accent), c.accent, AMOUNT.promoInk, [[c.accent], TEXT_CONTRAST]),
  ),
  token('promo-ink-soft', '#5c2d12', [ACCENT, BG, TEXT], (c) =>
    fadedButReadable(labelOn(c, c.accent), c.accent, AMOUNT.promoInkSoft, [
      [c.accent],
      TEXT_CONTRAST,
    ]),
  ),
  token('promo-ink-deep', '#2b1a10', [ACCENT, BG, TEXT], (c) =>
    fadedButReadable(labelOn(c, c.accent), c.accent, AMOUNT.promoInkDeep, [
      [c.accent],
      TEXT_CONTRAST,
    ]),
  ),
  // Second accent
  token('clay', '#c96b3c', [SECOND], (c) => c.secondAccent),
  token('clay-deep', '#8a4a28', [SECOND], (c) => mix(c.secondAccent, BLACK, AMOUNT.clayDeep)),
  token('sage', '#afbc82', [SECOND, TEXT], (c) => mix(c.secondAccent, c.text, AMOUNT.sage)),
  token('sage-light', '#b6c48c', [SECOND, TEXT], (c) =>
    mix(c.secondAccent, c.text, AMOUNT.sageLight),
  ),
  token('sage-soft', '#c3ce9a', [SECOND, TEXT], (c) =>
    mix(c.secondAccent, c.text, AMOUNT.sageSoft),
  ),
  token('sage-pale', '#d7dfbe', [SECOND, TEXT], (c) =>
    mix(c.secondAccent, c.text, AMOUNT.sagePale),
  ),
  token('sage-deep', '#7e8a55', [SECOND, BG], (c) =>
    mix(c.secondAccent, c.background, AMOUNT.sageDeep),
  ),
  // Light sections and paper cards: the page's colours the other way round
  token('paper', '#fffdf8', [TEXT, BG], paper),
  token('paper-accent', '#9a4f1c', [ACCENT, BG, TEXT], (c) =>
    strongEnough(c.accent, c.background, AMOUNT.paperAccent, [[ivory(c), paper(c)], TEXT_CONTRAST]),
  ),
  token('paper-line', '#e0d5c3', [TEXT, BG], (c) => mix(ivory(c), c.background, AMOUNT.paperLine)),
  token('paper-edge', '#b9a890', [TEXT, BG], (c) => mix(ivory(c), c.background, AMOUNT.paperEdge)),
  token('paper-text', '#4a3a2c', [TEXT, BG], (c) => mix(c.background, ivory(c), AMOUNT.paperText)),
  token('paper-quiet', '#6a5c4c', [TEXT, BG], (c) =>
    mix(c.background, ivory(c), AMOUNT.paperQuiet),
  ),
  token('paper-faint', '#8a7a66', [TEXT, BG], (c) =>
    mix(c.background, ivory(c), AMOUNT.paperFaint),
  ),
  // Errors: a fixed set for each kind of background
  token('danger-tint', DARK_DANGER.tint, [BG], (c) => dangerSet(c).tint),
  token('danger-line', DARK_DANGER.line, [BG], (c) => dangerSet(c).line),
  token('danger-text', DARK_DANGER.text, [BG], (c) => dangerSet(c).text),
];
