import { type IRootStyle } from '@core/interfaces/i-root-style';
import { themeRootStyle } from '@shared/utils/theme-root-style.util';
import { SiteTheme } from './site-theme.model';

/**
 * The theme's own chunk (ADR-0019): loaded only when a theme is stored, so most visits never
 * download the model.
 * @param dto The stored `site/theme` document.
 * @param preview Whether this is the owner's preview of a draft, which shows the theme as it is.
 * @returns What the page's root shows for it: today's look when it's malformed, or, for visitors,
 *   when it isn't readable (the rules can't check contrast, so the site does, whoever wrote it).
 */
export function themeStyleFor(dto: unknown, preview = false): IRootStyle {
  const theme = SiteTheme.from(dto);
  return themeRootStyle(theme.isReadable || preview ? theme : SiteTheme.default);
}
