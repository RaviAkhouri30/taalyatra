import { THEME_PRESETS } from '@shared/constants/theme-presets.constants';
import { DEFAULT_THEME_COLOURS } from '@shared/constants/theme.constants';
import { toRgb } from '@shared/utils/colour.util';
import { DARK_DANGER, LIGHT_DANGER, THEME_TOKENS, dangerSet } from './theme-tokens';

/** The largest channel difference between two colours. */
function distance(a: string, b: string): number {
  const [x, y] = [toRgb(a), toRgb(b)];
  return Math.max(...x.map((value, i) => Math.abs(value - y[i]!)));
}

/** How far a worked-out token may be from the design's hand-picked value, per channel. */
const TUNED = 30;

/**
 * The design's greens and the game's orange flare are hues none of the six colours has: a theme
 * works them out from its second accent instead, so they aren't expected to match.
 */
const OTHER_HUES = new Set(['flare', 'sage', 'sage-light', 'sage-soft', 'sage-pale', 'sage-deep']);

describe('THEME_TOKENS', () => {
  it('should name each token once when listing them', () => {
    const names = THEME_TOKENS.map((token) => token.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('should work out today’s value for each of the six colours’ own tokens', () => {
    const own = THEME_TOKENS.filter(
      (token) => token.sources.length === 1 && !token.name.includes('-'),
    );

    expect(own.map((token) => token.derive(DEFAULT_THEME_COLOURS))).toEqual(
      own.map((token) => token.fallback),
    );
  });

  it.each(
    THEME_TOKENS.filter(
      (token) => token.fallback.startsWith('#') && !OTHER_HUES.has(token.name),
    ).map((token) => [token.name, token]),
  )('should work out %s close to the design’s value when given today’s colours', (_name, token) => {
    expect(distance(token.derive(DEFAULT_THEME_COLOURS), token.fallback)).toBeLessThanOrEqual(
      TUNED,
    );
  });

  it('should use today’s error colours when the background is dark', () => {
    expect(dangerSet(DEFAULT_THEME_COLOURS)).toBe(DARK_DANGER);
  });

  it('should use the light error colours when the background is light', () => {
    const daylight = THEME_PRESETS.find((preset) => preset.label === 'Daylight')!;

    expect(dangerSet(daylight.colours)).toBe(LIGHT_DANGER);
  });
});
