import { type Festival } from '@shared/enums/festival.enum';
import { type FestivalGlyph } from '@shared/enums/festival-glyph.enum';
import { type IconName } from '@shared/enums/icon-name.enum';

/** A festival's own colours (2.16.0, from the owner's festival themes sheet). */
export interface IFestivalColours {
  /** Under the words: the band's and the badge's ground (`#rrggbb`). */
  readonly base: string;
  /** The glow in the band's corners and the badge's ring (`#rrggbb`). */
  readonly glow: string;
  /** Every word on the base; at least 4.5:1 against it (WCAG 2.2 AA). */
  readonly text: string;
}

/** How one festival looks on the offer badge and the offer band. */
export interface IFestivalLook {
  readonly festival: Festival;
  /** Its name in the editor. */
  readonly label: string;
  /** When it usually falls, shown beside its name in the editor. */
  readonly season: string;
  /** Its own colours, or `null` to keep the site theme's (Diwali and no festival). */
  readonly colours: IFestivalColours | null;
  /** The badge's icon. */
  readonly icon: IconName | FestivalGlyph;
  /** Whether it has an animation; no festival has none. */
  readonly animated: boolean;
}
