import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IMidCtaDto } from './i-mid-cta';

/** Reads the mid-page call-to-action band. */
@Service()
export class HomeMidCtaService extends ApiBaseService<IMidCtaDto> {
  public override attachViewDataHandler(): Observable<IMidCtaDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeMidCta);
  }
}
