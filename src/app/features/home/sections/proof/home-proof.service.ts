import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IProofDto } from './i-proof';

/** Reads the proof section. */
@Service()
export class HomeProofService extends ApiBaseService<IProofDto> {
  public override attachViewDataHandler(): Observable<IProofDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeProof);
  }
}
