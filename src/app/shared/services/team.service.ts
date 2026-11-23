import { Service } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { cacheLatest } from '@shared/utils/cache-latest.util';
import { shownOnly } from '@shared/utils/shown-only.util';
import { type ITeamMemberDto } from '@shared/interfaces/i-team-member';

/**
 * Reads the team in display order, shared by the home teaser and the Team page. Read once per
 * visit and replayed to every consumer (ADR-0011).
 */
@Service()
export class TeamService extends ApiBaseService<readonly ITeamMemberDto[]> {
  // shownOnly: a hidden item (2.15.0) never reaches a page, whichever page reads the list.
  private readonly cached$ = this.attachViewDataHandler().pipe(map(shownOnly), cacheLatest());

  public override attachViewDataHandler(): Observable<readonly ITeamMemberDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.Team);
  }

  /** @returns The list; read once, then replayed to every subscriber. */
  public getTeam(): Observable<readonly ITeamMemberDto[]> {
    return this.cached$;
  }
}
