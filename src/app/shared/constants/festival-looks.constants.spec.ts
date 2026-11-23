import { Festival } from '@shared/enums/festival.enum';
import { contrast } from '@shared/utils/colour.util';
import { FESTIVAL_LOOKS, festivalLook } from './festival-looks.constants';

/** WCAG 2.2 AA for normal text. */
const AA = 4.5;

describe('FESTIVAL_LOOKS', () => {
  it('should hold one look per festival', () => {
    expect(FESTIVAL_LOOKS.map((look) => look.festival)).toEqual(Object.values(Festival));
  });

  it.each(FESTIVAL_LOOKS.filter((look) => look.colours !== null))(
    'should keep the words readable on $label’s colour',
    ({ colours }) => {
      expect(contrast(colours?.text ?? '', colours?.base ?? '')).toBeGreaterThanOrEqual(AA);
    },
  );

  it('should keep the theme’s colours for Diwali and no festival', () => {
    expect(festivalLook(Festival.Diwali).colours).toBeNull();
    expect(festivalLook(Festival.None).colours).toBeNull();
  });

  it('should give every festival an animation except no festival', () => {
    expect(FESTIVAL_LOOKS.filter((look) => !look.animated).map((look) => look.festival)).toEqual([
      Festival.None,
    ]);
  });

  it('should fall back to no festival’s look when a name isn’t listed', () => {
    expect(festivalLook('fireworks').festival).toBe(Festival.None);
  });
});
