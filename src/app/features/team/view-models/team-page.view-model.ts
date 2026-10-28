import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { TeamService } from '@shared/services/team.service';
import { TeamPageModel } from '../models/team-page.model';
import { TeamPageService } from '../services/team-page.service';

/** Loads the Team page: its copy and the shared team, rendered in one pass. */
@Injectable()
export class TeamPageViewModel extends ViewModel<TeamPageModel> {
  private readonly pageService = inject(TeamPageService);
  private readonly teamService = inject(TeamService);

  protected override attachViewHandler(): Observable<unknown> {
    // combineLatest: one render once both the copy and the members are in.
    return combineLatest([
      this.pageService.attachViewDataHandler(),
      this.teamService.getTeam(),
    ]).pipe(
      tap(([dto, members]) => {
        this.setData(new TeamPageModel(dto, members));
      }),
    );
  }
}
