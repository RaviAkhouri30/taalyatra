import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IImage } from '@shared/interfaces/i-image';
import { type IShowFormatDto, type IShowSpotlightDto } from '@shared/interfaces/i-show-format';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { navLink } from '@shared/utils/link.util';

/**
 * The featured show format as a spotlight, shared by the home teaser and the Shows page (one
 * record in `showFormats`, ADR-0011).
 */
export class ShowSpotlightModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly text: string;
  public readonly image: IImage;
  /** Proposal form. */
  public readonly book: INavLink;
  /** Videos page. */
  public readonly watch: INavLink;

  private constructor(format: IShowFormatDto, spotlight: IShowSpotlightDto) {
    this.eyebrow = spotlight.eyebrow;
    this.title = spotlight.title;
    this.text = format.text;
    this.image = format.image;
    this.book = navLink(spotlight.primaryCta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.watch = navLink(spotlight.secondaryCta, AppRoute.Videos);
  }

  /**
   * @param formats The shared show formats.
   * @returns The first featured format with spotlight copy, or `null` when there is none.
   */
  public static from(formats: readonly IShowFormatDto[]): ShowSpotlightModel | null {
    const featured = formats.find((format) => format.featured && format.spotlight !== null);
    return featured?.spotlight ? new ShowSpotlightModel(featured, featured.spotlight) : null;
  }

  /** @returns The formats that are not featured, in order: the cards under the spotlight. */
  public static others(formats: readonly IShowFormatDto[]): readonly IShowFormatDto[] {
    return formats.filter((format) => !format.featured);
  }
}
