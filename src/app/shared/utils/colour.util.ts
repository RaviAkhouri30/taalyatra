/** A colour's red, green and blue channels, each 0–255. */
export type Rgb = readonly [number, number, number];

/** How the theme stores a colour: `#` and six lower-case hex digits (as `firestore.rules` checks). */
export const HEX_COLOUR = /^#[0-9a-f]{6}$/;

const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const HEX_PAIR = 2;
/** A checked colour's three hex pairs. */
const HEX_CHANNELS = /^#(..)(..)(..)$/;
const BLACK = '#000000';
const WHITE = '#ffffff';
/** WCAG 2.2's relative luminance: the sRGB curve and the channel weights. */
const SRGB_KNEE = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const LUMINANCE_WEIGHTS = { red: 0.2126, green: 0.7152, blue: 0.0722 } as const;
/** WCAG's flare term, added to both luminances of a contrast ratio. */
const CONTRAST_FLARE = 0.05;

/**
 * @param value A stored value.
 * @returns Whether it is a colour the theme can use.
 */
export function isHexColour(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOUR.test(value);
}

/**
 * @param hex A `#rrggbb` colour.
 * @returns Its channels.
 */
export function toRgb(hex: string): Rgb {
  const [, red = '', green = '', blue = ''] = HEX_CHANNELS.exec(hex) ?? [];
  const channel = (pair: string): number => Number.parseInt(pair, HEX_RADIX) || 0;
  return [channel(red), channel(green), channel(blue)];
}

/**
 * @param rgb Channels, which may be fractional.
 * @returns The `#rrggbb` colour, rounded.
 */
export function toHex(rgb: Rgb): string {
  return `#${rgb.map((value) => Math.round(value).toString(HEX_RADIX).padStart(HEX_PAIR, '0')).join('')}`;
}

/**
 * @param from A `#rrggbb` colour.
 * @param to Another.
 * @param amount How much of `to`, from 0 (all `from`) to 1 (all `to`).
 * @returns The two mixed in sRGB, as CSS `color-mix(in srgb, …)` does.
 */
export function mix(from: string, to: string, amount: number): string {
  const [r1, g1, b1] = toRgb(from);
  const [r2, g2, b2] = toRgb(to);
  const lerp = (start: number, end: number): number => start + (end - start) * amount;
  return toHex([lerp(r1, r2), lerp(g1, g2), lerp(b1, b2)]);
}

/**
 * @param hex A `#rrggbb` colour.
 * @returns Its relative luminance (WCAG 2.2), from 0 (black) to 1 (white).
 */
export function luminance(hex: string): number {
  const linear = (value: number): number => {
    const channel = value / CHANNEL_MAX;
    return channel <= SRGB_KNEE
      ? channel / SRGB_LINEAR_DIVISOR
      : ((channel + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;
  };
  const [red, green, blue] = toRgb(hex);
  return (
    linear(red) * LUMINANCE_WEIGHTS.red +
    linear(green) * LUMINANCE_WEIGHTS.green +
    linear(blue) * LUMINANCE_WEIGHTS.blue
  );
}

/**
 * @param a A `#rrggbb` colour.
 * @param b Another.
 * @returns Their contrast ratio (WCAG 2.2), from 1 to 21.
 */
export function contrast(a: string, b: string): number {
  const [first, second] = [luminance(a), luminance(b)];
  return (Math.max(first, second) + CONTRAST_FLARE) / (Math.min(first, second) + CONTRAST_FLARE);
}

/**
 * @param hex A `#rrggbb` colour.
 * @returns Whether white text reads better on it than black: a dark colour.
 */
export function isDark(hex: string): boolean {
  return contrast(hex, WHITE) > contrast(hex, BLACK);
}

/**
 * @param hex A `#rrggbb` colour.
 * @returns White for a dark colour and black for a light one: the direction "away from it".
 */
export function awayFrom(hex: string): string {
  return isDark(hex) ? WHITE : BLACK;
}
