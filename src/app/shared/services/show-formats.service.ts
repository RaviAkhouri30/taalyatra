import { Service } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IShowFormatDto } from '@shared/interfaces/i-show-format';
import { cacheLatest } from '@shared/utils/cache-latest.util';
import { shownOnly } from '@shared/utils/shown-only.util';

/** Reads the show formats, shared by the home teaser and the Shows page (ADR-0011). */
@Service()
export class ShowFormatsService extends ApiBaseService<readonly IShowFormatDto[]> {
  // shownOnly: a hidden item (2.15.0) never reaches a page, whichever page reads the list.
  private readonly cached$ = this.attachViewDataHandler().pipe(map(shownOnly), cacheLatest());

  public override attachViewDataHandler(): Observable<readonly IShowFormatDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.ShowFormats);
  }

  /** @returns The formats in display order; read once, then replayed to every subscriber. */
  public getFormats(): Observable<readonly IShowFormatDto[]> {
    return this.cached$;
  }
}
