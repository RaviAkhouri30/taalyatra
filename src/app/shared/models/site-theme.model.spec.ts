import { THEME_PRESETS } from '@shared/constants/theme.constants';
import { ThemeBackdrop } from '@shared/enums/theme-backdrop.enum';
import { ThemeFonts } from '@shared/enums/theme-fonts.enum';
import { ThemeHeadingWeight } from '@shared/enums/theme-heading-weight.enum';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { ThemeTextSize } from '@shared/enums/theme-text-size.enum';
import { SiteTheme, ThemeVariable } from './site-theme.model';
import { LIGHT_DANGER } from './theme-tokens';

const DAYLIGHT = THEME_PRESETS.find((preset) => preset.preset === ThemePreset.Daylight)!;

describe('SiteTheme', () => {
  describe('from', () => {
    it.each([null, undefined, 'dark', 3])('should give today’s look when given %s', (stored) => {
      expect(SiteTheme.from(stored)).toBe(SiteTheme.default);
    });

    it('should keep today’s value for each field when the document is empty', () => {
      expect(SiteTheme.from({}).choices).toEqual(SiteTheme.default.choices);
    });

    it('should read every field when given a complete document', () => {
      const theme = SiteTheme.from({
        preset: 'daylight',
        ...DAYLIGHT.colours,
        backdrop: 'gradient',
        textSize: 'larger',
        headingWeight: 'bold',
        fonts: 'fraunces-inter',
      });

      expect(theme.choices).toEqual({
        preset: ThemePreset.Daylight,
        colours: DAYLIGHT.colours,
        backdrop: ThemeBackdrop.Gradient,
        textSize: ThemeTextSize.Larger,
        headingWeight: ThemeHeadingWeight.Bold,
        fonts: ThemeFonts.FrauncesInter,
      });
    });

    it.each([
      { accent: 'orange' },
      { text: '#FFFFFF' },
      { preset: 'midnight' },
      { textSize: 'huge' },
      { fonts: 'comic-sans' },
    ])('should give today’s look when a value isn’t one of the choices: %o', (stored) => {
      expect(SiteTheme.from(stored)).toBe(SiteTheme.default);
    });
  });

  describe('variables', () => {
    it('should set nothing when the theme is today’s look', () => {
      expect(SiteTheme.default.variables().size).toBe(0);
    });

    it('should set only the accent’s tokens when only the accent changes', () => {
      const names = [...SiteTheme.from({ accent: '#ffb21e' }).variables().keys()];

      expect(names).toContain('--ty-amber');
      expect(names).not.toContain('--ty-ink');
      expect(names).not.toContain('--ty-cream');
    });

    it('should set the background and the light error colours when given Daylight', () => {
      const variables = SiteTheme.from(DAYLIGHT.colours).variables();

      expect(variables.get('--ty-ink')).toBe('#faf6f0');
      expect(variables.get('--ty-danger-text')).toBe(LIGHT_DANGER.text);
    });

    it('should set a gradient from the background to the cards when the backdrop is a gradient', () => {
      const variables = SiteTheme.from({ backdrop: 'gradient' }).variables();

      expect(variables.get(ThemeVariable.Backdrop)).toBe(
        'linear-gradient(180deg, #171210, #241c17)',
      );
    });

    it('should set the text scale and heading weight when they aren’t today’s', () => {
      const variables = SiteTheme.from({ textSize: 'larger', headingWeight: 'bold' }).variables();

      expect(variables.get(ThemeVariable.TextScale)).toBe('1.1');
      expect(variables.get(ThemeVariable.HeadingWeight)).toBe('700');
    });

    it('should set both font stacks when the pair isn’t today’s', () => {
      const variables = SiteTheme.from({ fonts: 'yatra-mukta' }).variables();

      expect(variables.get(ThemeVariable.FontDisplay)).toContain('Yatra One');
      expect(variables.get(ThemeVariable.FontBody)).toContain('Mukta');
    });
  });

  describe('fontPair', () => {
    it('should need no stylesheet when the fonts are today’s', () => {
      expect(SiteTheme.default.fontPair.stylesheets).toEqual([]);
    });

    it('should load the pair from Google Fonts when the fonts aren’t today’s', () => {
      expect(SiteTheme.from({ fonts: 'poppins-nunito' }).fontPair.stylesheets[0]).toMatch(
        /^https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins/,
      );
    });
  });

  describe('contrast', () => {
    it('should pass every check when the theme is today’s look', () => {
      expect(SiteTheme.default.contrast().filter((result) => !result.passes)).toEqual([]);
    });

    it.each(THEME_PRESETS.map((preset) => [preset.label, preset]))(
      'should pass every check when given the ready-made theme %s',
      (_label, preset) => {
        const theme = SiteTheme.from({ ...preset.colours, backdrop: preset.backdrop });

        expect(theme.contrast().filter((result) => !result.passes)).toEqual([]);
      },
    );

    it('should not be readable when the quiet text matches the background', () => {
      expect(SiteTheme.from({ quietText: '#171210' }).isReadable).toBe(false);
    });
  });
});
