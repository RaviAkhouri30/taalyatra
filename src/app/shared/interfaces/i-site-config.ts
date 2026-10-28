import { type IBrand } from './i-brand';
import { type IContactDetails } from './i-contact-details';
import { type IPromotion } from './i-promotion';
import { type ISocialLink } from './i-social-link';

/** Site-wide content shared by every page's chrome (header, footer, floating actions). */
export interface ISiteConfig {
  readonly brand: IBrand;
  readonly contact: IContactDetails;
  readonly socials: readonly ISocialLink[];
  /** Active promotion, or `null` when no offer is running. */
  readonly promotion: IPromotion | null;
  readonly copyrightYear: number;
}

/** A social profile as stored; WhatsApp is not stored, it is derived from the phone number. */
export interface ISocialLinkDto {
  /** A `SocialPlatform` value; unknown platforms are skipped. */
  readonly platform: string;
  readonly label: string;
  readonly href: string;
}

/** The running offer as stored; the badge always links to the home page's offer section. */
export interface IPromotionDto {
  readonly label: string;
  readonly subtitle: string;
  readonly dismissLabel: string;
}

/** Site-wide content as stored in `site/config` (plain JSON: no enums, nothing derived). */
export interface ISiteConfigDto {
  readonly brand: IBrand;
  readonly contact: IContactDetails;
  readonly socials: readonly ISocialLinkDto[];
  readonly promotion: IPromotionDto | null;
  readonly copyrightYear: number;
}
