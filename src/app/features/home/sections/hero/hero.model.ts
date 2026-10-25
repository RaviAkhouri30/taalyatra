import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { toTelHref, toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IHomeHeroDto } from './i-home-hero';

/** Home hero view model data: copy from the backend plus links built from the contact details. */
export class HeroModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly highlight: string;
  public readonly lead: string;
  public readonly audiences: readonly string[];
  public readonly proposal: INavLink;
  public readonly whatsApp: IExternalLink;
  public readonly call: IExternalLink;
  public readonly game: INavLink;

  public constructor(dto: IHomeHeroDto, contact: IContactDetails) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.highlight = dto.highlight;
    this.lead = dto.lead;
    this.audiences = dto.audiences;
    this.proposal = navLink(dto.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.whatsApp = externalLink(dto.whatsAppCta, toWhatsAppUrl(contact.phone));
    this.call = externalLink(
      `${dto.callCtaPrefix} ${contact.phone.display}`,
      toTelHref(contact.phone),
    );
    this.game = navLink(dto.gameCta, AppRoute.Home, { fragment: PageAnchor.Play });
  }
}
