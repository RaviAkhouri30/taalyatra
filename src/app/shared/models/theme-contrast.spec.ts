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

describe('the contact note (2.9.1)', () => {
  // Sandstone as first designed (0027): its contact note was 4.27:1, found by axe.
  const firstSandstone = {
    background: '#f6efe4',
    cards: '#fffaf2',
    text: '#2b1f17',
    quietText: '#5f4f42',
    accent: '#9c3d1c',
    secondAccent: '#3f6b4a',
    backdrop: 'gradient',
  };

  it('should fail and ask for a darker second accent when the note is hard to read', () => {
    const [note] = failures(firstSandstone);

    expect(note).toMatchObject({
      label: 'The contact note',
      ratio: 4.2,
      bySite: false,
      advice: 'Make the second accent darker.',
    });
  });

  it('should still show on the site when only the note fails, as it did before 2.9.1', () => {
    expect(SiteTheme.from(firstSandstone).isReadable).toBe(true);
  });

  it('should pass with today’s look', () => {
    const note = SiteTheme.default.contrast().find((result) => result.label === 'The contact note');

    expect(note?.passes).toBe(true);
    expect(note?.bySite).toBe(false);
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
