import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { PAGES, provideFakeContent } from '@shared/testing/fixtures';
import { AdminPageService } from './admin-page.service';

describe('AdminPageService', () => {
  it('should read the admin copy', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });

    await expect(
      firstValueFrom(TestBed.inject(AdminPageService).attachViewDataHandler()),
    ).resolves.toEqual(PAGES.admin);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.PagesAdmin);
  });
});
