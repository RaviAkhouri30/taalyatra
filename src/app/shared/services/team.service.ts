import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ITeamMemberDto } from '@shared/interfaces/i-team-member';

/** Reads the team, in display order (home teaser and Team page). */
@Service()
export class TeamService extends ApiBaseService<readonly ITeamMemberDto[]> {
  public override attachViewDataHandler(): Observable<readonly ITeamMemberDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.Team);
  }
}
