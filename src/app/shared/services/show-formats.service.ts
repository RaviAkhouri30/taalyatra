import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IShowFormatDto } from '@shared/interfaces/i-show-format';
import { cacheLatest } from '@shared/utils/cache-latest.util';

/** Reads the show formats, shared by the home teaser and the Shows page (ADR-0011). */
@Service()
export class ShowFormatsService extends ApiBaseService<readonly IShowFormatDto[]> {
  private readonly cached$ = this.attachViewDataHandler().pipe(cacheLatest());

  public override attachViewDataHandler(): Observable<readonly IShowFormatDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.ShowFormats);
  }

  /** @returns The formats in display order; read once, then replayed to every subscriber. */
  public getFormats(): Observable<readonly IShowFormatDto[]> {
    return this.cached$;
  }
}
