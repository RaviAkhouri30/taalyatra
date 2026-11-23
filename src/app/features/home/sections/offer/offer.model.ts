import { shownOnly } from '@shared/utils/shown-only.util';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type Festival } from '@shared/enums/festival.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { festivalOfTheme } from '@shared/utils/festival.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IOfferCardDto, type IOfferDto } from './i-offer';

/** Seasonal offer ready for display: its festival look and call-to-action links. */
export class OfferModel {
  public readonly festival: Festival;
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly cards: readonly IOfferCardDto[];
  public readonly proposal: INavLink;
  public readonly whatsApp: IExternalLink;
  public readonly footnote: string;

  /**
   * @param dto The stored offer.
   * @param contact The contact details, for the WhatsApp button.
   * @param festival The festival chosen with the offer's dates; `null` reads the offer's old
   * animation instead, so an offer from before 2.16.0 looks as it did.
   */
  public constructor(dto: IOfferDto, contact: IContactDetails, festival: Festival | null = null) {
    this.festival = festival ?? festivalOfTheme(dto.theme);
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    // A hidden card (2.15.0) isn't shown.
    this.cards = shownOnly(dto.cards);
    this.proposal = navLink(dto.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.whatsApp = externalLink(dto.whatsAppCta, toWhatsAppUrl(contact.phone));
    this.footnote = dto.footnote;
  }
}
