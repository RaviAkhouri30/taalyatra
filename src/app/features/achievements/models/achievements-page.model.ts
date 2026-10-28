import { AppRoute } from '@shared/enums/app-route.enum';
import { type IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { toIconName } from '@shared/utils/icon-name.util';
import { navLink } from '@shared/utils/link.util';
import {
  type IAchievementSectionDto,
  type IAchievementStatDto,
  type IAchievementsPageDto,
  type IMilestoneDto,
  type IPerformanceDto,
  type IPressDto,
  type IRecognitionDto,
} from './i-achievements-page';

/** A recognition card with its icon resolved. */
export interface IRecognitionCard extends Omit<IRecognitionDto, 'icon'> {
  readonly icon: IconName;
}

/** A press mention: a link when its article is known, plain text otherwise. */
export interface IPressItem extends Omit<IPressDto, 'url'> {
  readonly url: string | null;
}

/** The Achievements page, ready for display. */
export class AchievementsPageModel {
  public readonly hero: IPageHeroDto;
  public readonly stats: readonly IAchievementStatDto[];
  public readonly milestones: IAchievementSectionDto<IMilestoneDto>;
  public readonly recognition: IAchievementSectionDto<IRecognitionCard>;
  public readonly press: IAchievementSectionDto<IPressItem>;
  public readonly performances: IAchievementSectionDto<IPerformanceDto>;
  public readonly ctaTitle: string;
  public readonly ctaText: string;
  /** "Request a proposal": the proposal form. */
  public readonly request: INavLink;
  /** "See show formats": the Shows page. */
  public readonly shows: INavLink;

  /** @param dto The page copy. */
  public constructor(dto: IAchievementsPageDto) {
    this.hero = dto.hero;
    this.stats = dto.stats;
    this.milestones = dto.milestones;
    this.recognition = {
      eyebrow: dto.recognition.eyebrow,
      title: dto.recognition.title,
      items: dto.recognition.items.map((item) => ({
        icon: toIconName(item.icon),
        title: item.title,
        text: item.text,
      })),
    };
    this.press = {
      ...dto.press,
      items: dto.press.items.map((item) => ({ ...item, url: item.url || null })),
    };
    this.performances = dto.performances;
    this.ctaTitle = dto.cta.title;
    this.ctaText = dto.cta.text;
    this.request = navLink(dto.cta.primary, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.shows = navLink(dto.cta.secondary, AppRoute.Shows);
  }
}
