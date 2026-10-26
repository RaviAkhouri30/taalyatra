import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IMidCtaDto } from './i-mid-cta';

/** Call-to-action band with its proposal and WhatsApp links. */
export class MidCtaModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly proposal: INavLink;
  public readonly whatsApp: IExternalLink;

  public constructor(dto: IMidCtaDto, contact: IContactDetails) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.proposal = navLink(dto.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.whatsApp = externalLink(dto.whatsAppCta, toWhatsAppUrl(contact.phone));
  }
}
