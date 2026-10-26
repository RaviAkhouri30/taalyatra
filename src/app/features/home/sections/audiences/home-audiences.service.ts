import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IAudiencesDto } from './i-audiences';

/** Reads the "Who it's for" section. */
@Service()
export class HomeAudiencesService extends ApiBaseService<IAudiencesDto> {
  public override attachViewDataHandler(): Observable<IAudiencesDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeAudiences);
  }
}
