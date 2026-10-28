import { SOCIAL_ICONS } from '@shared/constants/social.constants';
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { type IBrand } from '@shared/interfaces/i-brand';
import { type IContactDetails, type IPhoneNumber } from '@shared/interfaces/i-contact-details';
import { type IPromotion } from '@shared/interfaces/i-promotion';
import {
  type IPromotionDto,
  type ISiteConfig,
  type ISiteConfigDto,
  type ISocialLinkDto,
} from '@shared/interfaces/i-site-config';
import { type ISocialLink } from '@shared/interfaces/i-social-link';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { navLink } from '@shared/utils/link.util';

/**
 * Stored platform names the site can show, with their icons. WhatsApp is left out: it is derived
 * from the phone number, never read from storage.
 */
const STORED_PLATFORMS: ReadonlyMap<string, readonly [SocialPlatform, IconName]> = new Map(
  [...SOCIAL_ICONS]
    .filter(([platform]) => platform !== SocialPlatform.WhatsApp)
    .map(([platform, icon]) => [platform, [platform, icon]]),
);

/**
 * Site-wide content built from `site/config`. Adds what storage leaves out: the WhatsApp link,
 * derived from the phone number so the number is stored once, the social icons, and the promo
 * badge's link to the offer section.
 */
export class SiteConfigModel implements ISiteConfig {
  public readonly brand: IBrand;
  public readonly contact: IContactDetails;
  /** WhatsApp first, then the stored profiles with a known platform. */
  public readonly socials: readonly ISocialLink[];
  public readonly promotion: IPromotion | null;
  public readonly copyrightYear: number;

  /** @param dto The stored site configuration. */
  public constructor(dto: ISiteConfigDto) {
    this.brand = dto.brand;
    this.contact = dto.contact;
    this.copyrightYear = dto.copyrightYear;
    this.socials = [
      SiteConfigModel.whatsApp(dto.contact.phone),
      ...dto.socials.flatMap((social) => SiteConfigModel.socialLink(social)),
    ];
    this.promotion = dto.promotion === null ? null : SiteConfigModel.promotion(dto.promotion);
  }

  private static whatsApp(phone: IPhoneNumber): ISocialLink {
    return {
      platform: SocialPlatform.WhatsApp,
      label: 'WhatsApp',
      href: toWhatsAppUrl(phone),
      icon: IconName.WhatsApp,
    };
  }

  /** @returns The link in a one-item list, or an empty list for an unknown platform. */
  private static socialLink(dto: ISocialLinkDto): ISocialLink[] {
    const known = STORED_PLATFORMS.get(dto.platform);
    if (known === undefined) {
      return [];
    }
    const [platform, icon] = known;
    return [{ platform, label: dto.label, href: dto.href, icon }];
  }

  private static promotion(dto: IPromotionDto): IPromotion {
    return {
      link: navLink(dto.label, AppRoute.Home, { fragment: PageAnchor.Diwali }),
      subtitle: dto.subtitle,
      dismissLabel: dto.dismissLabel,
    };
  }
}
