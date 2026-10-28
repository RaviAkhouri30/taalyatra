import { AppRoute } from '@shared/enums/app-route.enum';
import { type IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IImage } from '@shared/interfaces/i-image';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';
import { type IShowFormatDto } from '@shared/interfaces/i-show-format';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { ShowSpotlightModel } from '@shared/models/show-spotlight.model';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { toIconName } from '@shared/utils/icon-name.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IShowsPageDto } from './i-shows-page';

/** A label and value shown under a format, e.g. "Ensemble · 6–8 players". */
export interface IShowSpec {
  readonly label: string;
  readonly value: string;
}

/** A show format ready for its card. */
export interface IShowFormatCard {
  readonly image: IImage;
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
  readonly specs: readonly IShowSpec[];
}

/** The Shows page: its copy plus the shared show formats with their specs. */
export class ShowsPageModel {
  public readonly hero: IPageHeroDto;
  /** "Enquire about a show": the proposal form. */
  public readonly enquire: INavLink;
  /** "WhatsApp us": the business number from site config. */
  public readonly whatsApp: IExternalLink;
  public readonly formatsSection: Omit<IShowsPageDto['formats'], 'labels'>;
  /** The featured format (classical concerts), shown above the cards; `null` when none. */
  public readonly spotlight: ShowSpotlightModel | null;
  public readonly formats: readonly IShowFormatCard[];
  public readonly setups: IShowsPageDto['setups'];
  public readonly process: IShowsPageDto['process'];
  /** "Request a proposal": the proposal form. */
  public readonly request: INavLink;
  /** "Watch us play": the Videos page. */
  public readonly watch: INavLink;

  /**
   * @param dto The page copy.
   * @param formats The shared show formats.
   * @param site Site config: the WhatsApp number.
   */
  public constructor(dto: IShowsPageDto, formats: readonly IShowFormatDto[], site: ISiteConfig) {
    const { labels, ...formatsSection } = dto.formats;
    this.hero = dto.hero;
    this.enquire = navLink(dto.heroPrimaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.whatsApp = externalLink(dto.heroWhatsAppCta, toWhatsAppUrl(site.contact.phone));
    this.formatsSection = formatsSection;
    this.spotlight = ShowSpotlightModel.from(formats);
    this.formats = ShowSpotlightModel.others(formats).map((format) => ({
      image: format.image,
      icon: toIconName(format.icon),
      title: format.title,
      text: format.text,
      specs: [
        { label: labels.ensemble, value: format.ensemble },
        { label: labels.setLength, value: format.setLength },
        { label: labels.bestFor, value: format.bestFor },
      ],
    }));
    this.setups = dto.setups;
    this.process = dto.process;
    this.request = navLink(dto.process.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.watch = navLink(dto.process.secondaryCta, AppRoute.Videos);
  }
}
