import { TEXT_CONTRAST, UI_CONTRAST } from '@shared/constants/theme.constants';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { WHITE, contrast, luminance, mix } from '@shared/utils/colour.util';
import { DANGER_TINT_RED, DARK_DANGER, LIGHT_DANGER } from './theme-tokens';

/** A theme's colour tokens by name (`ink`, `surface`…), each `#rrggbb` except `danger-tint`. */
export type ThemeTokenValues = ReadonlyMap<string, string>;

/** One pair of colours the design puts together, and how readable they must be. */
interface IContrastPair {
  /** What the owner sees, e.g. "Quiet text on cards". */
  readonly label: string;
  /** The token drawn on top, or a function for a colour worked out at check time. */
  readonly front: string | ((tokens: ThemeTokenValues) => string);
  /** The token underneath, likewise. */
  readonly ground: string | ((tokens: ThemeTokenValues) => string);
  /** WCAG 2.2 AA's ratio for it: 4.5 for text, 3 for a component's edge. */
  readonly needs: number;
  /** The theme colour to change when it fails. */
  readonly fix: ThemeColour;
  /** The colour to change is underneath (labels on an accent), not on top. */
  readonly fixesGround: boolean;
  /** Whether the site checks it too, and ignores a published theme that fails it. */
  readonly bySite: boolean;
}

/** The result of one pair's check, for the Theme page and the publish check. */
export interface IContrastResult {
  readonly label: string;
  /** The ratio, e.g. 4.62 (shown to one decimal place, rounded down). */
  readonly ratio: number;
  readonly needs: number;
  readonly passes: boolean;
  /** The theme colour to change. */
  readonly fix: ThemeColour;
  /** "Make the quiet text lighter.", or empty when it passes. */
  readonly advice: string;
  /**
   * Whether the site checks it too. A pair added after 2.2.0 is the Theme page's and the publish
   * check's only, so a theme already published keeps showing until it's next changed (2.9.1).
   */
  readonly bySite: boolean;
}

/** How each theme colour is named in advice. */
export const THEME_COLOUR_NAMES: Readonly<Record<ThemeColour, string>> = {
  [ThemeColour.Background]: 'background',
  [ThemeColour.Cards]: 'cards’ colour',
  [ThemeColour.Text]: 'text',
  [ThemeColour.QuietText]: 'quiet text',
  [ThemeColour.Accent]: 'accent',
  [ThemeColour.SecondAccent]: 'second accent',
};

/** How much accent the admin menu's current page is tinted with (`editor-layout`'s `.sel`). */
const ACCENT_TINT = 0.18;

/** The admin menu's current page: an 18 % accent tint over the background. */
function accentTint(tokens: ThemeTokenValues): string {
  return mix(tokens.get('ink') ?? '', tokens.get('amber') ?? '', ACCENT_TINT);
}

/** How much white the contact note lays over the second accent (`contact-aside`'s `.cnote`). */
const NOTE_TINT = 0.1;

/** The contact note's panel: a 10 % white tint over the second accent, as it shows (2.9.1). */
function noteGround(tokens: ThemeTokenValues): string {
  return mix(tokens.get('clay') ?? '', WHITE, NOTE_TINT);
}

/** The error box's red tint laid over cards, as it shows. */
function errorGround(tokens: ThemeTokenValues): string {
  const set = tokens.get('danger-tint') === LIGHT_DANGER.tint ? LIGHT_DANGER : DARK_DANGER;
  return mix(tokens.get('surface') ?? '', DANGER_TINT_RED, set.tintOpacity);
}

/** A pair's threshold and which side to change, when not text on top (4.5:1). */
interface IPairOptions {
  readonly needs?: number;
  readonly fixesGround?: boolean;
  readonly bySite?: boolean;
}

function pair(
  label: string,
  [front, ground]: readonly [IContrastPair['front'], IContrastPair['ground']],
  fix: ThemeColour,
  options: IPairOptions = {},
): IContrastPair {
  const { needs = TEXT_CONTRAST, fixesGround = false, bySite = true } = options;
  return { label, front, ground, needs, fix, fixesGround, bySite };
}

const UNDERNEATH: IPairOptions = { fixesGround: true };
const EDGE: IPairOptions = { needs: UI_CONTRAST };

const { Background, Text, QuietText, Accent, SecondAccent } = ThemeColour;

/** Every pair checked, in the order the Theme page lists them (0021 design, "The contrast check"). */
const CONTRAST_PAIRS: readonly IContrastPair[] = [
  pair('Text on the background', ['cream', 'ink'], Text),
  pair('Text on cards', ['cream', 'surface'], Text),
  pair('Quiet text on the background', ['muted', 'ink'], QuietText),
  pair('Quiet text on cards', ['muted', 'surface'], QuietText),
  pair('Fine print on cards', ['muted-strong', 'surface'], QuietText),
  pair('Notes on cards', ['muted-faint', 'surface'], QuietText),
  pair('Placeholders in fields', ['placeholder', 'surface'], QuietText),
  pair('Accent on the background', ['amber', 'ink'], Accent),
  pair('Accent on cards', ['amber', 'surface'], Accent),
  pair('Highlighted links', ['amber-soft', 'ink'], Accent),
  pair('The admin’s current page', ['amber', accentTint], Accent),
  pair('Button labels on the accent', ['ink', 'amber'], Accent, UNDERNEATH),
  pair('Offer text on the accent', ['promo-ink-soft', 'amber'], Accent),
  pair('Second accent on the background', ['clay', 'ink'], SecondAccent),
  pair('Labels on the second accent', ['ink', 'clay'], SecondAccent, UNDERNEATH),
  // Found by axe with Sandstone (0027). Not the site's: see `IContrastResult.bySite`.
  pair('The contact note', ['ink', noteGround], SecondAccent, { ...UNDERNEATH, bySite: false }),
  pair('Error messages', ['danger-text', errorGround], Background, UNDERNEATH),
  pair('Text in light sections', ['ink', 'ivory'], Text, UNDERNEATH),
  pair('Labels in light sections', ['paper-accent', 'ivory'], Accent),
  pair('Text on quote cards', ['paper-quiet', 'paper'], Text, UNDERNEATH),
  pair('Field edges on cards', ['field-border', 'surface'], QuietText, EDGE),
  pair('Field edges on the background', ['field-border', 'ink'], QuietText, EDGE),
  pair('Outline buttons', ['bronze', 'ink'], QuietText, EDGE),
];

const ONE_DECIMAL = 10;

function colourOf(ref: IContrastPair['front'], tokens: ThemeTokenValues): string {
  return typeof ref === 'string' ? (tokens.get(ref) ?? '') : ref(tokens);
}

/** Which way the fix goes: the colour to change moves away from the other one. */
function advice(entry: IContrastPair, front: string, ground: string): string {
  const [changed, other] = entry.fixesGround ? [ground, front] : [front, ground];
  const direction = luminance(changed) >= luminance(other) ? 'lighter' : 'darker';
  return `Make the ${THEME_COLOUR_NAMES[entry.fix]} ${direction}.`;
}

/**
 * @param tokens Every themed token's value.
 * @returns Each pair's result, in the Theme page's order.
 */
export function contrastResults(tokens: ThemeTokenValues): readonly IContrastResult[] {
  return CONTRAST_PAIRS.map((entry) => {
    const front = colourOf(entry.front, tokens);
    const ground = colourOf(entry.ground, tokens);
    const ratio = contrast(front, ground);
    const passes = ratio >= entry.needs;
    return {
      label: entry.label,
      ratio: Math.floor(ratio * ONE_DECIMAL) / ONE_DECIMAL,
      needs: entry.needs,
      passes,
      fix: entry.fix,
      advice: passes ? '' : advice(entry, front, ground),
      bySite: entry.bySite,
    };
  });
}

/**
 * @param result A failed pair.
 * @returns The sentence the Theme page and the publish check show for it.
 */
export function contrastMessage(result: IContrastResult): string {
  return `${result.label} is ${result.ratio.toString()}:1; it needs ${result.needs.toString()}:1. ${result.advice}`;
}
