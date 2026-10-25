import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeHeroDto } from './i-home-hero';

/** Reads the home hero content. */
@Service()
export class HomeHeroService extends ApiBaseService<IHomeHeroDto> {
  public override attachViewDataHandler(): Observable<IHomeHeroDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeHero);
  }
}
