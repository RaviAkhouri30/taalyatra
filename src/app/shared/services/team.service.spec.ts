import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { TEAM_FIXTURE, provideFakeContent } from '@shared/testing/fixtures';
import { TeamService } from './team.service';

describe('TeamService', () => {
  it('should read the shared list once, whatever the number of consumers', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const service = TestBed.inject(TeamService);

    const first = await firstValueFrom(service.getTeam());
    const second = await firstValueFrom(service.getTeam());

    expect(first).toEqual(TEAM_FIXTURE);
    expect(second).toBe(first);
    expect(backend.get).toHaveBeenCalledTimes(1);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.Team);
  });
});
