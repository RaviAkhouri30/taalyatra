import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { PAGES, provideFakeContent } from '@shared/testing/fixtures';
import { AchievementsPageService } from './achievements-page.service';

describe('AchievementsPageService', () => {
  it('should read the page document', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });

    const page = await firstValueFrom(
      TestBed.inject(AchievementsPageService).attachViewDataHandler(),
    );

    expect(page).toEqual(PAGES.achievements);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.PagesAchievements);
  });
});
