import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeShowsDto } from './i-home-shows';

/** Reads the shows teaser. */
@Service()
export class HomeShowsService extends ApiBaseService<IHomeShowsDto> {
  public override attachViewDataHandler(): Observable<IHomeShowsDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeShows);
  }
}
