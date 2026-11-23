import { Festival } from '@shared/enums/festival.enum';
import { FestivalGlyph } from '@shared/enums/festival-glyph.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IFestivalLook } from '@shared/interfaces/i-festival-look';

/** An offer outside a festival (F5): the theme's colours, the music note, no animation. */
const NO_FESTIVAL_LOOK: IFestivalLook = {
  festival: Festival.None,
  label: 'No festival',
  season: 'any time',
  colours: null,
  icon: IconName.MusicNote,
  animated: false,
};

/**
 * The eleven festival looks, in the editor's order (2.16.0, from the owner's festival themes
 * sheet; design decisions F1–F6). Colours live here, as the theme presets' do, so a unit test can
 * check every pair's contrast. Navratri's base is lifted from the sheet's `#D7263D` (F2) so its
 * words pass 4.5:1.
 */
export const FESTIVAL_LOOKS: readonly IFestivalLook[] = [
  {
    festival: Festival.Diwali,
    label: 'Diwali',
    season: 'Oct / Nov',
    colours: null,
    icon: FestivalGlyph.Diya,
    animated: true,
  },
  {
    festival: Festival.Holi,
    label: 'Holi',
    season: 'March',
    colours: { base: '#e4428f', glow: '#f2b705', text: '#2a0b18' },
    icon: IconName.Flower,
    animated: true,
  },
  {
    festival: Festival.Navratri,
    label: 'Navratri',
    season: 'Sep / Oct',
    colours: { base: '#de4b5e', glow: '#f46036', text: '#2b0709' },
    icon: IconName.FourPointStar,
    animated: true,
  },
  {
    festival: Festival.GaneshChaturthi,
    label: 'Ganesh Chaturthi',
    season: 'Aug / Sep',
    colours: { base: '#f2994a', glow: '#c1272d', text: '#2b0a08' },
    icon: FestivalGlyph.Om,
    animated: true,
  },
  {
    festival: Festival.Dussehra,
    label: 'Dussehra',
    season: 'Sep / Oct',
    colours: { base: '#f7c948', glow: '#a4161a', text: '#2b0709' },
    icon: IconName.Pennant,
    animated: true,
  },
  {
    festival: Festival.Baisakhi,
    label: 'Baisakhi',
    season: 'April',
    colours: { base: '#f7c948', glow: '#3f7d20', text: '#16200c' },
    icon: IconName.Wheat,
    animated: true,
  },
  {
    festival: Festival.Gurpurab,
    label: 'Gurpurab',
    season: 'Nov (varies)',
    colours: { base: '#f3d77f', glow: '#1f4e79', text: '#0e1b26' },
    icon: IconName.Wheel,
    animated: true,
  },
  {
    festival: Festival.Christmas,
    label: 'Christmas',
    season: 'December',
    colours: { base: '#c1121f', glow: '#2d6a4f', text: '#fff6f0' },
    icon: IconName.Snowflake,
    animated: true,
  },
  {
    festival: Festival.Halloween,
    label: 'Halloween',
    season: '31 October',
    colours: { base: '#ff7b00', glow: '#5a189a', text: '#1a0a22' },
    icon: IconName.Moon,
    animated: true,
  },
  {
    festival: Festival.NewYear,
    label: 'New Year',
    season: '31 Dec / 1 Jan',
    colours: { base: '#e9a552', glow: '#6d4aff', text: '#120c28' },
    icon: IconName.Twinkle,
    animated: true,
  },
  NO_FESTIVAL_LOOK,
];

/** The Om sign the Ganesh Chaturthi badge shows (`FestivalGlyph.Om`). */
export const OM_SIGN = 'ॐ';

/** Each look by its festival's stored name. */
const LOOKS_BY_NAME: ReadonlyMap<string, IFestivalLook> = new Map(
  FESTIVAL_LOOKS.map((look) => [look.festival, look]),
);

/**
 * @param festival A festival's name.
 * @returns Its look; no festival's for a name not in the list.
 */
export function festivalLook(festival: string): IFestivalLook {
  return LOOKS_BY_NAME.get(festival) ?? NO_FESTIVAL_LOOK;
}
