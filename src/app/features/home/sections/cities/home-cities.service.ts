import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ICitiesDto } from './i-cities';

/** Reads the "Where we play" section. */
@Service()
export class HomeCitiesService extends ApiBaseService<ICitiesDto> {
  public override attachViewDataHandler(): Observable<ICitiesDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeCities);
  }
}
