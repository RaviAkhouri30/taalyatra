import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHowDto } from './i-how';

/** Reads the "How it works" section. */
@Service()
export class HomeHowService extends ApiBaseService<IHowDto> {
  public override attachViewDataHandler(): Observable<IHowDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeHow);
  }
}
