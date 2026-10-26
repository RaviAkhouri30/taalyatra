import { AppRoute } from '@shared/enums/app-route.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { type ITeamMemberDto } from '@shared/interfaces/i-team-member';
import { navLink } from '@shared/utils/link.util';
import { type IHomeTeamDto } from './i-home-team';

/** Team teaser: heading, link to the Team page and the first few members. */
export class HomeTeamModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly teamPage: INavLink;
  public readonly members: readonly ITeamMemberDto[];

  public constructor(dto: IHomeTeamDto, team: readonly ITeamMemberDto[]) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.teamPage = navLink(dto.cta, AppRoute.Team);
    this.members = team.slice(0, dto.count);
  }
}
