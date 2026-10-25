import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';

/** Reads the experience names shown in the scrolling strip. */
@Service()
export class HomeMarqueeService extends ApiBaseService<readonly string[]> {
  public override attachViewDataHandler(): Observable<readonly string[]> {
    return this.attachViewApiHandler(ApiEndpoint.HomeMarquee);
  }
}
