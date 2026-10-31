import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';
import { TeamService } from '@shared/services/team.service';
import { HomeTeamModel } from './home-team.model';
import { HomeTeamService } from './home-team.service';

/** Loads the teaser heading and the team. */
@Injectable()
export class HomeTeamViewModel extends ViewModel<HomeTeamModel> {
  private readonly headingService = inject(HomeTeamService);
  private readonly teamService = inject(TeamService);
  private readonly visibilityService = inject(SiteVisibilityService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.headingService.attachViewDataHandler(),
      this.teamService.getTeam(),
      this.visibilityService.getVisibility(),
    ]).pipe(
      tap(([heading, team, visibility]) => {
        this.setData(new HomeTeamModel(heading, team, visibility));
      }),
    );
  }
}
