import { type INavLink } from './i-site-link';

/** A seasonal offer advertised by the floating promo badge. */
export interface IPromotion {
  /** Where the badge links to; its label is the badge title. */
  readonly link: INavLink;
  readonly subtitle: string;
  readonly dismissLabel: string;
}
