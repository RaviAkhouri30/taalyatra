import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ITeamPageDto } from '../models/i-team-page';

/** Reads the Team page copy (`pages/team`). */
@Service()
export class TeamPageService extends ApiBaseService<ITeamPageDto> {
  public override attachViewDataHandler(): Observable<ITeamPageDto> {
    return this.attachViewApiHandler(ApiEndpoint.PagesTeam);
  }
}
