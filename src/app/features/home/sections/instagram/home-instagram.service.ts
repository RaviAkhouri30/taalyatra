import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IInstagramDto } from './i-instagram';

/** Reads the Instagram section (posts can later come from Instagram through the same port). */
@Service()
export class HomeInstagramService extends ApiBaseService<IInstagramDto> {
  public override attachViewDataHandler(): Observable<IInstagramDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeInstagram);
  }
}
