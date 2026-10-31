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
  /** Labels shared by several pages; a missing one is an empty string. */
  readonly labels: ISiteLabels;
  /** Footer credit, or `null` when none is stored. */
  readonly credit: ISiteCredit | null;
}

/** UI strings used by more than one page, stored once (ADR-0011). */
export interface ISiteLabels {
  /** Accessible name of a video card, with `{title}`. */
  readonly watchVideo: string;
  /** Text of the "Visit us" phone link (the number is in its accessible name). */
  readonly callUs: string;
  /** Action announced on the copyable address, e.g. "Copy address". */
  readonly copyAddress: string;
  /** Toast after the address is copied. */
  readonly addressCopied: string;
  /** Toast when the clipboard is unavailable. */
  readonly copyFailed: string;
}

/** "Developed with love by …" line in the footer. */
export interface ISiteCredit {
  readonly label: string;
  readonly name: string;
  /** The developer's profile, opened in a new tab. */
  readonly url: string;
  /** Accessible name of the link (says where it goes and that it opens a new tab). */
  readonly linkLabel: string;
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
  /** The owner's on/off switch; missing in older data, which means on. */
  readonly live?: boolean;
  /** First day shown (YYYY-MM-DD, Pune time), or `null` for no start date. */
  readonly startsOn?: string | null;
  /** Last day shown (YYYY-MM-DD, Pune time), or `null` for no end date. */
  readonly endsOn?: string | null;
}

/**
 * Site-wide content as stored in `site/config` (plain JSON: no enums, nothing derived). Brand,
 * contact and year are required; the rest may be absent (older data, a field removed in the
 * console), and the site then hides or falls back for just that item.
 */
export interface ISiteConfigDto {
  readonly brand: IBrand;
  readonly contact: IContactDetails;
  readonly copyrightYear: number;
  readonly socials?: readonly ISocialLinkDto[];
  readonly promotion?: IPromotionDto | null;
  readonly labels?: Partial<ISiteLabels>;
  readonly credit?: ISiteCredit | null;
}
