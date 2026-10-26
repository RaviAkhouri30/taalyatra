import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IDrumCircleDto } from './i-drum-circle';

/** Reads the Drum Circle details. */
@Service()
export class HomeDrumCircleService extends ApiBaseService<IDrumCircleDto> {
  public override attachViewDataHandler(): Observable<IDrumCircleDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeDrumCircle);
  }
}
