import { FestiveTheme } from '@shared/enums/festive-theme.enum';
import { isFestiveTheme, toFestiveTheme } from './festive-theme.util';

describe('festive theme utils', () => {
  it('should accept supported themes and draw nothing for unknown ones', () => {
    expect(isFestiveTheme('sparks')).toBe(true);
    expect(toFestiveTheme('sparks')).toBe(FestiveTheme.Sparks);
    expect(toFestiveTheme('fireworks')).toBe(FestiveTheme.None);
  });
});
