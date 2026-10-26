import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IPhilosophyDto } from './i-philosophy';

/** Reads the philosophy section. */
@Service()
export class HomePhilosophyService extends ApiBaseService<IPhilosophyDto> {
  public override attachViewDataHandler(): Observable<IPhilosophyDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomePhilosophy);
  }
}
