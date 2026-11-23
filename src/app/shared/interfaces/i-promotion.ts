import { type Festival } from '@shared/enums/festival.enum';
import { type INavLink } from './i-site-link';

/** A seasonal offer advertised by the floating promo badge. */
export interface IPromotion {
  /** Where the badge links to; its label is the badge title. */
  readonly link: INavLink;
  readonly subtitle: string;
  readonly dismissLabel: string;
  /** The festival look chosen with the dates (2.16.0); `null` when none was chosen yet. */
  readonly festival: Festival | null;
}
