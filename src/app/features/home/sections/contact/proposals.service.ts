import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiWriteBaseService } from '@shared/base/api-write-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ProposalValue } from './proposal-form';

/** Stores proposal requests, so a lead survives even when its email goes missing. */
@Service()
export class ProposalsService extends ApiWriteBaseService<ProposalValue> {
  public override create(proposal: ProposalValue): Observable<void> {
    return this.attachCreateApiHandler(ApiEndpoint.Proposals, proposal);
  }
}
