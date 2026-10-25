import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ITrustCardDto } from './i-trust-card';

/** Reads the reassurance cards. */
@Service()
export class HomeTrustService extends ApiBaseService<readonly ITrustCardDto[]> {
  public override attachViewDataHandler(): Observable<readonly ITrustCardDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.HomeTrust);
  }
}
