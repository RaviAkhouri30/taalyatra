import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SHOW_FORMATS_FIXTURE, provideFakeContent } from '@shared/testing/fixtures';
import { ShowFormatsService } from './show-formats.service';

describe('ShowFormatsService', () => {
  it('should read the shared list once, whatever the number of consumers', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const service = TestBed.inject(ShowFormatsService);

    const first = await firstValueFrom(service.getFormats());
    const second = await firstValueFrom(service.getFormats());

    expect(first).toEqual(SHOW_FORMATS_FIXTURE);
    expect(second).toBe(first);
    expect(backend.get).toHaveBeenCalledTimes(1);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.ShowFormats);
  });
});
