import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { PAGES, provideFakeContent } from '@shared/testing/fixtures';
import { ShowsPageService } from './shows-page.service';

describe('ShowsPageService', () => {
  it('should read the page document', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });

    const page = await firstValueFrom(TestBed.inject(ShowsPageService).attachViewDataHandler());

    expect(page).toEqual(PAGES.shows);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.PagesShows);
  });
});
