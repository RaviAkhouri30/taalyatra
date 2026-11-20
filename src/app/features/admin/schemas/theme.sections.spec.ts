import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { RESET_VALUES } from '../models/theme-form';
import { THEME_SECTION } from './theme.sections';

describe('THEME_SECTION', () => {
  it('should leave the stored preset out of the form, which works it out', () => {
    expect(THEME_SECTION.view?.read({ preset: 'daylight', accent: '#9a4a12' })).toEqual({
      accent: '#9a4a12',
    });
  });

  it('should read nothing when nothing is stored', () => {
    expect(THEME_SECTION.view?.read(null)).toEqual({});
  });

  it('should store the form with the ready-made theme it matches', () => {
    expect(THEME_SECTION.view?.write({}, RESET_VALUES)).toEqual({
      ...RESET_VALUES,
      preset: ThemePreset.WarmNight,
    });
  });

  it('should list today’s value first in every choice, so an empty document keeps it', () => {
    const firsts = THEME_SECTION.fields.flatMap((field) =>
      'options' in field ? [[field.key, field.options[0]?.value]] : [],
    );

    expect(Object.fromEntries(firsts)).toEqual({
      backdrop: RESET_VALUES['backdrop'],
      textSize: RESET_VALUES['textSize'],
      headingWeight: RESET_VALUES['headingWeight'],
      fonts: RESET_VALUES['fonts'],
    });
  });
});
