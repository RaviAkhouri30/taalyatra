import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IOfferDto } from './i-offer';

/** Reads the current seasonal offer. */
@Service()
export class HomeOfferService extends ApiBaseService<IOfferDto> {
  public override attachViewDataHandler(): Observable<IOfferDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeOffer);
  }
}
