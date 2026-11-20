import { DEFAULT_ROOT_STYLE } from '@shared/constants/theme-default.constants';
import { themeStyleFor } from './site-theme-style';

describe('themeStyleFor', () => {
  it('should work out the stored theme’s style when it is readable', () => {
    expect(
      themeStyleFor({ background: '#000000', cards: '#121212' }).variables.get('--ty-ink'),
    ).toBe('#000000');
  });

  it('should give today’s look when the stored theme isn’t readable', () => {
    expect(themeStyleFor({ text: '#171210' })).toEqual(DEFAULT_ROOT_STYLE);
  });

  it('should show an unreadable theme as it is when the visit is the owner’s preview', () => {
    expect(themeStyleFor({ text: '#171210' }, true).variables.get('--ty-cream')).toBe('#171210');
  });
});
