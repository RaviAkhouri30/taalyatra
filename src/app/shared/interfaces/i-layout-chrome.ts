import { type FooterVariant, type PromoVariant } from '@shared/enums/variant.enums';
import { type IFooterColumn } from './i-footer-column';
import { type INavLink } from './i-site-link';

/** Everything that differs between the home page and inner pages' chrome. */
export interface ILayoutChrome {
  readonly brandLink: INavLink;
  readonly mainNav: readonly INavLink[];
  readonly mobileNav: readonly INavLink[];
  readonly headerCta: INavLink;
  readonly actionBarCta: INavLink;
  readonly footer: FooterVariant;
  /** Link columns of the footer; contact details are appended by the footer itself. */
  readonly footerColumns: readonly IFooterColumn[];
  readonly promo: PromoVariant;
  readonly showWhatsAppFab: boolean;
}
