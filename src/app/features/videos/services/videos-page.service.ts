import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IVideosPageDto } from '../models/i-videos-page';

/** Reads the Videos page copy (`pages/videos`). */
@Service()
export class VideosPageService extends ApiBaseService<IVideosPageDto> {
  public override attachViewDataHandler(): Observable<IVideosPageDto> {
    return this.attachViewApiHandler(ApiEndpoint.PagesVideos);
  }
}
