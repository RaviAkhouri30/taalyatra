import { type IRootStyle } from '@core/interfaces/i-root-style';
import { DEFAULT_BACKGROUND } from '@shared/constants/theme-default.constants';
import { type SiteTheme } from '@shared/models/site-theme.model';

/**
 * @param theme The theme to show.
 * @returns What the page's root needs for it: its variables, its fonts' stylesheets, the browser
 *   bar's colour, and the background to remember (none for today's, which the stylesheet paints).
 */
export function themeRootStyle(theme: SiteTheme): IRootStyle {
  const { background } = theme.choices.colours;
  return {
    variables: theme.variables(),
    stylesheets: theme.fontPair.stylesheets,
    browserColour: background,
    rememberedBackground: background === DEFAULT_BACKGROUND ? null : background,
  };
}
