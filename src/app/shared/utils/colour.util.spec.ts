import {
  awayFrom,
  contrast,
  isDark,
  isHexColour,
  luminance,
  mix,
  toHex,
  toRgb,
} from './colour.util';

describe('colour.util', () => {
  it('should accept a lower-case #rrggbb colour when checking a stored value', () => {
    expect(isHexColour('#e9a552')).toBe(true);
  });

  it.each(['#E9A552', '#fff', 'e9a552', 'red', 12, null])(
    'should reject %s when checking a stored value',
    (value) => {
      expect(isHexColour(value)).toBe(false);
    },
  );

  it('should read the channels when given a hex colour', () => {
    expect(toRgb('#e9a552')).toEqual([233, 165, 82]);
  });

  it('should round and pad the channels when writing a hex colour', () => {
    expect(toHex([0.4, 15.6, 255])).toBe('#0010ff');
  });

  it('should mix in the given share of the second colour when mixing two', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('should keep the first colour when mixing none of the second', () => {
    expect(mix('#171210', '#ffffff', 0)).toBe('#171210');
  });

  it('should give black 0 and white 1 when working out luminance', () => {
    expect([luminance('#000000'), luminance('#ffffff')]).toEqual([0, 1]);
  });

  it('should give 21:1 when comparing black and white', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21);
  });

  it('should give the same ratio whichever colour comes first', () => {
    expect(contrast('#efe6d9', '#171210')).toBeCloseTo(contrast('#171210', '#efe6d9'));
  });

  it('should match the design record when comparing today’s text and background', () => {
    expect(contrast('#efe6d9', '#171210')).toBeCloseTo(15.03, 1);
  });

  it('should call today’s background dark and Daylight’s light', () => {
    expect([isDark('#171210'), isDark('#faf6f0')]).toEqual([true, false]);
  });

  it('should point toward white from a dark colour and toward black from a light one', () => {
    expect([awayFrom('#171210'), awayFrom('#faf6f0')]).toEqual(['#ffffff', '#000000']);
  });
});
