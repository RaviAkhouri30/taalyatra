import { AppRoute } from '@shared/enums/app-route.enum';
import { type FestiveTheme } from '@shared/enums/festive-theme.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { toFestiveTheme } from '@shared/utils/festive-theme.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IOfferCardDto, type IOfferDto } from './i-offer';

/** Seasonal offer ready for display: validated theme and call-to-action links. */
export class OfferModel {
  public readonly theme: FestiveTheme;
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly cards: readonly IOfferCardDto[];
  public readonly proposal: INavLink;
  public readonly whatsApp: IExternalLink;
  public readonly footnote: string;

  public constructor(dto: IOfferDto, contact: IContactDetails) {
    this.theme = toFestiveTheme(dto.theme);
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.cards = dto.cards;
    this.proposal = navLink(dto.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.whatsApp = externalLink(dto.whatsAppCta, toWhatsAppUrl(contact.phone));
    this.footnote = dto.footnote;
  }
}
