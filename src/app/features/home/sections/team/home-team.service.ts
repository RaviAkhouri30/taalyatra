import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeTeamDto } from './i-home-team';

/** Reads the team teaser heading. */
@Service()
export class HomeTeamService extends ApiBaseService<IHomeTeamDto> {
  public override attachViewDataHandler(): Observable<IHomeTeamDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeTeam);
  }
}
