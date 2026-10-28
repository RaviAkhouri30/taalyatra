import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { VIDEOS_FIXTURE, provideFakeContent } from '@shared/testing/fixtures';
import { VideosService } from './videos.service';

describe('VideosService', () => {
  it('should read the shared list once, whatever the number of consumers', async () => {
    const backend = provideFakeContent();
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const service = TestBed.inject(VideosService);

    const first = await firstValueFrom(service.getVideos());
    const second = await firstValueFrom(service.getVideos());

    expect(first).toEqual(VIDEOS_FIXTURE);
    expect(second).toBe(first);
    expect(backend.get).toHaveBeenCalledTimes(1);
    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.Videos);
  });
});
