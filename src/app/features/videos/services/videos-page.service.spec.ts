import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { PAGES, provideFakeContent } from '@shared/testing/fixtures';
import { VideosPageService } from './videos-page.service';

describe('VideosPageService', () => {
  it('should read the page document', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });

    const page = await firstValueFrom(TestBed.inject(VideosPageService).attachViewDataHandler());

    expect(page).toEqual(PAGES.videos);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.PagesVideos);
  });
});
