import { Festival } from '@shared/enums/festival.enum';
import { festivalOfTheme, isFestival, toFestival } from './festival.util';

describe('festival utils', () => {
  it('should accept every festival name and nothing else', () => {
    expect(Object.values(Festival).every((festival) => isFestival(festival))).toBe(true);
    expect(isFestival('fireworks')).toBe(false);
    expect(isFestival(3)).toBe(false);
  });

  it('should read a stored festival when one is chosen', () => {
    expect(toFestival('holi')).toBe(Festival.Holi);
  });

  it('should give no choice when the offer has no festival yet', () => {
    expect(toFestival(undefined)).toBeNull();
    expect(toFestival(null)).toBeNull();
  });

  it('should treat an unknown festival as no festival', () => {
    expect(toFestival('fireworks')).toBe(Festival.None);
  });

  it('should read the old sparks as Diwali and anything else as no festival', () => {
    expect(festivalOfTheme('sparks')).toBe(Festival.Diwali);
    expect(festivalOfTheme('none')).toBe(Festival.None);
    expect(festivalOfTheme(undefined)).toBe(Festival.None);
  });
});
