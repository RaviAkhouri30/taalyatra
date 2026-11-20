import { SiteTheme } from '@shared/models/site-theme.model';
import { themeRootStyle } from './theme-root-style.util';

describe('themeRootStyle', () => {
  it('should set nothing and remember nothing when the theme is today’s look', () => {
    expect(themeRootStyle(SiteTheme.default)).toEqual({
      variables: new Map(),
      stylesheets: [],
      browserColour: '#171210',
      rememberedBackground: null,
    });
  });

  it('should remember the background and colour the browser bar when it isn’t today’s', () => {
    const style = themeRootStyle(SiteTheme.from({ background: '#000000', cards: '#121212' }));

    expect(style.rememberedBackground).toBe('#000000');
    expect(style.browserColour).toBe('#000000');
  });

  it('should load the font pair and its fallbacks when the fonts aren’t today’s', () => {
    const [fonts, fallbacks] = themeRootStyle(SiteTheme.from({ fonts: 'space-work' })).stylesheets;

    expect(fonts).toContain('family=Space+Grotesk');
    expect(fallbacks).toBe('fonts/space-work.css');
  });
});
