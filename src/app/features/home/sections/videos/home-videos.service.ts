import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeVideosDto } from './i-home-videos';

/** Reads the "Latest videos" heading. */
@Service()
export class HomeVideosService extends ApiBaseService<IHomeVideosDto> {
  public override attachViewDataHandler(): Observable<IHomeVideosDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeVideos);
  }
}
