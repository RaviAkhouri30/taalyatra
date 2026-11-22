import {
  DEFAULT_FONT_PAIR,
  DEFAULT_THEME_COLOURS,
  THEME_FONT_PAIRS,
  THEME_HEADING_WEIGHTS,
  THEME_TEXT_SCALES,
  THEME_VARIABLE_PREFIX,
  type IThemeFontPair,
  type ThemeColours,
} from '@shared/constants/theme.constants';
import { ThemeBackdrop } from '@shared/enums/theme-backdrop.enum';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { ThemeFonts } from '@shared/enums/theme-fonts.enum';
import { ThemeHeadingWeight } from '@shared/enums/theme-heading-weight.enum';
import { ThemeTextSize } from '@shared/enums/theme-text-size.enum';
import { type ISiteThemeDto } from '@shared/interfaces/i-site-theme';
import { isHexColour } from '@shared/utils/colour.util';
import { type IContrastResult, type ThemeTokenValues, contrastResults } from './theme-contrast';
import { THEME_TOKENS } from './theme-tokens';

/** The CSS variables a theme sets beyond its colour tokens (`_theme.scss`, `_tokens.scss`). */
export enum ThemeVariable {
  Backdrop = '--ty-backdrop',
  TextScale = '--ty-text-scale',
  HeadingWeight = '--ty-heading-weight',
  FontDisplay = '--ty-font-display',
  FontBody = '--ty-font-body',
}

/**
 * Everything a theme chooses; the stored document's fields, checked. Not `preset`: it only names
 * the ready-made theme in the admin, so the site leaves it out, and with it the list of names (0027).
 */
export interface ISiteThemeChoices {
  readonly colours: ThemeColours;
  readonly backdrop: ThemeBackdrop;
  readonly textSize: ThemeTextSize;
  readonly headingWeight: ThemeHeadingWeight;
  readonly fonts: ThemeFonts;
}

const DEFAULT_CHOICES: ISiteThemeChoices = {
  colours: DEFAULT_THEME_COLOURS,
  backdrop: ThemeBackdrop.Plain,
  textSize: ThemeTextSize.Standard,
  headingWeight: ThemeHeadingWeight.ExtraBold,
  fonts: ThemeFonts.BricolageDm,
};

/**
 * @param values An enum's values.
 * @param stored A stored value.
 * @returns Whether it's missing (today's value applies) or one of the values.
 */
function isChoiceOrMissing(values: Record<string, string>, stored: unknown): boolean {
  return stored === undefined || Object.values(values).includes(stored as string);
}

/** @returns Whether every stored field is missing or one of its choices. */
function isWellFormed(dto: ISiteThemeDto): boolean {
  const stored = new Map(Object.entries(dto));
  return (
    Object.values(ThemeColour).every(
      (key) => stored.get(key) === undefined || isHexColour(stored.get(key)),
    ) &&
    // Any name: a ready-made theme added in a later release still shows.
    (dto.preset === undefined || typeof dto.preset === 'string') &&
    isChoiceOrMissing(ThemeBackdrop, dto.backdrop) &&
    isChoiceOrMissing(ThemeTextSize, dto.textSize) &&
    isChoiceOrMissing(ThemeHeadingWeight, dto.headingWeight) &&
    isChoiceOrMissing(ThemeFonts, dto.fonts)
  );
}

/**
 * @param values An enum's values.
 * @param stored A stored value.
 * @param fallback Today's value.
 * @returns The stored value as the enum's, or today's when it's missing.
 */
function pick<T extends string>(values: Record<string, T>, stored: unknown, fallback: T): T {
  return Object.values(values).find((value) => value === stored) ?? fallback;
}

/** The six colours of a well-formed document; a missing one keeps today's. */
function storedColours(dto: ISiteThemeDto): ThemeColours {
  const d = DEFAULT_THEME_COLOURS;
  return {
    background: dto.background ?? d.background,
    cards: dto.cards ?? d.cards,
    text: dto.text ?? d.text,
    quietText: dto.quietText ?? d.quietText,
    accent: dto.accent ?? d.accent,
    secondAccent: dto.secondAccent ?? d.secondAccent,
  };
}

/** Reads a well-formed document; a missing field keeps today's value. */
function choices(dto: ISiteThemeDto): ISiteThemeChoices {
  const d = DEFAULT_CHOICES;
  return {
    colours: storedColours(dto),
    backdrop: pick(ThemeBackdrop, dto.backdrop, d.backdrop),
    textSize: pick(ThemeTextSize, dto.textSize, d.textSize),
    headingWeight: pick(ThemeHeadingWeight, dto.headingWeight, d.headingWeight),
    fonts: pick(ThemeFonts, dto.fonts, d.fonts),
  };
}

/** @returns The theme colours that aren't today's. */
function changedColours(colours: ThemeColours): ReadonlySet<string> {
  const defaults = new Map(Object.entries(DEFAULT_THEME_COLOURS));
  return new Set(
    Object.entries(colours)
      .filter(([key, value]) => defaults.get(key) !== value)
      .map(([key]) => key),
  );
}

/**
 * The site's theme (0021, ADR-0019): six colours, the background, text size, heading weight and
 * fonts. It works out every colour token and checks each pair's contrast. Pure: applying it to the
 * page is `RootStyleService`'s job.
 */
export class SiteTheme {
  /** Today's look: what the site shows when no theme is published. */
  public static readonly default = new SiteTheme(DEFAULT_CHOICES);

  private constructor(public readonly choices: ISiteThemeChoices) {}

  /** The font pair it uses. */
  public get fontPair(): IThemeFontPair {
    return THEME_FONT_PAIRS.find((pair) => pair.fonts === this.choices.fonts) ?? DEFAULT_FONT_PAIR;
  }

  /**
   * Whether every pair of colours the site checks is readable (WCAG 2.2 AA). The Theme page and the
   * publish check use every pair, `contrast()`.
   */
  public get isReadable(): boolean {
    return this.contrast().every((result) => result.passes || !result.bySite);
  }

  /**
   * @param dto The stored `site/theme` document, or anything else.
   * @returns Its theme; today's look when it isn't a document or a value isn't one of the choices
   *   (a missing field keeps today's value), so a bad write can't break the site.
   */
  public static from(dto: unknown): SiteTheme {
    if (typeof dto !== 'object' || dto === null) {
      return SiteTheme.default;
    }
    const stored = dto as ISiteThemeDto;
    return isWellFormed(stored) ? new SiteTheme(choices(stored)) : SiteTheme.default;
  }

  /** @returns Every themed colour token's value: worked out, or today's when its colours are. */
  public tokens(): ThemeTokenValues {
    const changed = changedColours(this.choices.colours);
    return new Map(
      THEME_TOKENS.map((token) => [
        token.name,
        token.sources.some((source) => changed.has(source))
          ? token.derive(this.choices.colours)
          : token.fallback,
      ]),
    );
  }

  /** @returns Each pair's contrast result. */
  public contrast(): readonly IContrastResult[] {
    return contrastResults(this.tokens());
  }

  /**
   * @returns The CSS variables to set on the page: only those that differ from today's, so with
   *   today's look it sets nothing and the stylesheet's defaults apply.
   */
  public variables(): ReadonlyMap<string, string> {
    const fallbacks = new Map(THEME_TOKENS.map((token) => [token.name, token.fallback]));
    const result = new Map(
      [...this.tokens()]
        .filter(([name, value]) => fallbacks.get(name) !== value)
        .map(([name, value]) => [`${THEME_VARIABLE_PREFIX}${name}`, value]),
    );
    for (const [name, value] of this.extraVariables()) {
      result.set(name, value);
    }
    return result;
  }

  private extraVariables(): [ThemeVariable, string][] {
    const { backdrop, textSize, headingWeight, colours: c } = this.choices;
    const pair = this.fontPair;
    const result: [ThemeVariable, string][] = [];
    if (backdrop === ThemeBackdrop.Gradient) {
      result.push([ThemeVariable.Backdrop, `linear-gradient(180deg, ${c.background}, ${c.cards})`]);
    }
    if (textSize !== DEFAULT_CHOICES.textSize) {
      result.push([ThemeVariable.TextScale, String(THEME_TEXT_SCALES.get(textSize))]);
    }
    if (headingWeight !== DEFAULT_CHOICES.headingWeight) {
      result.push([ThemeVariable.HeadingWeight, String(THEME_HEADING_WEIGHTS.get(headingWeight))]);
    }
    if (pair.stylesheets.length > 0) {
      result.push([ThemeVariable.FontDisplay, pair.display], [ThemeVariable.FontBody, pair.body]);
    }
    return result;
  }
}
