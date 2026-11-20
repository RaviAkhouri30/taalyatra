import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { SiteTheme } from './site-theme.model';
import { type IContrastResult, contrastMessage } from './theme-contrast';

function failures(stored: object): readonly IContrastResult[] {
  return SiteTheme.from(stored)
    .contrast()
    .filter((result) => !result.passes);
}

describe('contrastResults (through SiteTheme.contrast)', () => {
  it('should check text at 4.5:1 and field edges at 3:1', () => {
    const results = SiteTheme.default.contrast();

    expect(results.find((result) => result.label === 'Text on the background')?.needs).toBe(4.5);
    expect(results.find((result) => result.label === 'Field edges on cards')?.needs).toBe(3);
  });

  it('should round the ratio down to one decimal place', () => {
    const text = SiteTheme.default.contrast().find((result) => result.label === 'Text on cards');

    expect(text?.ratio).toBe(13.5);
  });

  it('should ask for lighter quiet text when it’s too dark on a dark page', () => {
    const quiet = failures({ quietText: '#3a3a3a' }).find(
      (result) => result.label === 'Quiet text on cards',
    );

    expect(quiet).toMatchObject({
      fix: ThemeColour.QuietText,
      advice: 'Make the quiet text lighter.',
    });
  });

  it('should ask for a lighter accent when button labels on it are too dark to read', () => {
    const labels = failures({ accent: '#5a3a10' }).find(
      (result) => result.label === 'Button labels on the accent',
    );

    expect(labels?.advice).toBe('Make the accent lighter.');
  });

  it('should leave the advice empty when a pair passes', () => {
    expect(SiteTheme.default.contrast().every((result) => result.advice === '')).toBe(true);
  });
});

describe('contrastMessage', () => {
  it('should name the pair, its ratio, the threshold and the fix when a pair fails', () => {
    const [first] = failures({ quietText: '#3a3a3a' });

    expect(contrastMessage(first!)).toMatch(
      /^Quiet text on the background is \d+(\.\d)?:1; it needs 4\.5:1\. Make the quiet text lighter\.$/,
    );
  });
});
