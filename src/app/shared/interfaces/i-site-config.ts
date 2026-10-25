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
