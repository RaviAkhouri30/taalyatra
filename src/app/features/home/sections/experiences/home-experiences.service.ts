import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IExperiencesDto } from './i-experiences';

/** Reads the experiences section. */
@Service()
export class HomeExperiencesService extends ApiBaseService<IExperiencesDto> {
  public override attachViewDataHandler(): Observable<IExperiencesDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeExperiences);
  }
}
