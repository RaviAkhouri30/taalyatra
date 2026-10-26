import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IVideoDto } from '@shared/interfaces/i-video';

/** Reads the video library (newest first), shared by the home teaser and the Videos page. */
@Service()
export class VideosService extends ApiBaseService<readonly IVideoDto[]> {
  public override attachViewDataHandler(): Observable<readonly IVideoDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.Videos);
  }
}
