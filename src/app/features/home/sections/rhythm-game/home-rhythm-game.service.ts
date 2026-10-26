import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IRhythmGameDto } from './i-rhythm-game';

/** Reads the rhythm game copy. */
@Service()
export class HomeRhythmGameService extends ApiBaseService<IRhythmGameDto> {
  public override attachViewDataHandler(): Observable<IRhythmGameDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeRhythmGame);
  }
}
