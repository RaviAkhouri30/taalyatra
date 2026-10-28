import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { type IVideoCard, type IVideoDto } from '@shared/interfaces/i-video';
import { formatTemplate } from '@shared/utils/format-template.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { toVideoCards } from '@shared/utils/video-cards.util';
import { type IVideosPageDto } from './i-videos-page';

/**
 * The Videos page: its copy, the shared library as cards, and the categories, which are derived
 * from the videos in first-appearance order rather than stored (ADR-0011).
 */
export class VideosPageModel {
  public readonly hero: IPageHeroDto;
  public readonly filterLabel: string;
  public readonly allLabel: string;
  /** "All" first, then each category in the order it first appears. */
  public readonly categories: readonly string[];
  /** The site's YouTube profile, or `null` when none is configured. */
  public readonly channel: IExternalLink | null;
  public readonly plan: INavLink;

  private readonly cards: readonly IVideoCard[];

  /**
   * @param dto The page copy.
   * @param videos The shared video library.
   * @param site Site config: the card label and the YouTube profile.
   */
  public constructor(
    private readonly dto: IVideosPageDto,
    videos: readonly IVideoDto[],
    site: ISiteConfig,
  ) {
    this.hero = dto.hero;
    this.filterLabel = dto.filterLabel;
    this.allLabel = dto.allLabel;
    this.categories = [dto.allLabel, ...new Set(videos.map((video) => video.category))];
    this.cards = toVideoCards(videos, site.labels.watchVideo);
    const youTube = site.socials.find((social) => social.platform === SocialPlatform.YouTube);
    this.channel = youTube ? externalLink(dto.channelCta, youTube.href) : null;
    this.plan = navLink(dto.planCta, AppRoute.Home, { fragment: PageAnchor.Contact });
  }

  /** @returns The cards in `category`, or every card for "All". */
  public cardsIn(category: string): readonly IVideoCard[] {
    return category === this.allLabel
      ? this.cards
      : this.cards.filter((card) => card.video.category === category);
  }

  /** @returns "Showing {count} videos". */
  public countLabel(count: number): string {
    return formatTemplate(this.dto.showingLabel, { count });
  }

  /** @returns "Featured · {category}" for the featured video's own category. */
  public featuredLabel(card: IVideoCard): string {
    return formatTemplate(this.dto.featuredLabel, { category: card.video.category });
  }
}
