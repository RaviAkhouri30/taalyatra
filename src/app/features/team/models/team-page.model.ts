import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IPageHeroDto } from '@shared/interfaces/i-page-hero';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { type ITeamMemberDto } from '@shared/interfaces/i-team-member';
import { navLink } from '@shared/utils/link.util';
import { type ITeamPageDto } from './i-team-page';

/** The Team page: its copy plus every member of the shared `team` collection. */
export class TeamPageModel {
  public readonly hero: IPageHeroDto;
  public readonly members: readonly ITeamMemberDto[];
  public readonly funFactLabel: string;
  public readonly values: ITeamPageDto['values'];
  public readonly ctaTitle: string;
  public readonly ctaText: string;
  /** "Plan your session": the proposal form. */
  public readonly plan: INavLink;
  /** "Watch our videos": the Videos page. */
  public readonly videos: INavLink;

  /**
   * @param dto The page copy.
   * @param members The shared team, in display order.
   */
  public constructor(dto: ITeamPageDto, members: readonly ITeamMemberDto[]) {
    this.hero = dto.hero;
    this.members = members;
    this.funFactLabel = dto.funFactLabel;
    this.values = dto.values;
    this.ctaTitle = dto.cta.title;
    this.ctaText = dto.cta.text;
    this.plan = navLink(dto.cta.primary, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.videos = navLink(dto.cta.secondary, AppRoute.Videos);
  }
}
