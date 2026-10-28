import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IShowsPageDto } from '../models/i-shows-page';

/** Reads the Shows page copy (`pages/shows`). */
@Service()
export class ShowsPageService extends ApiBaseService<IShowsPageDto> {
  public override attachViewDataHandler(): Observable<IShowsPageDto> {
    return this.attachViewApiHandler(ApiEndpoint.PagesShows);
  }
}
