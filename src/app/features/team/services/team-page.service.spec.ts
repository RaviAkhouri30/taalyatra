import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { PAGES, provideFakeContent } from '@shared/testing/fixtures';
import { TeamPageService } from './team-page.service';

describe('TeamPageService', () => {
  it('should read the page document', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });

    const page = await firstValueFrom(TestBed.inject(TeamPageService).attachViewDataHandler());

    expect(page).toEqual(PAGES.team);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.PagesTeam);
  });
});
