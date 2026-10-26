import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IFaqDto } from './i-faq';

/** Reads the FAQ. */
@Service()
export class HomeFaqService extends ApiBaseService<IFaqDto> {
  public override attachViewDataHandler(): Observable<IFaqDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeFaq);
  }
}
