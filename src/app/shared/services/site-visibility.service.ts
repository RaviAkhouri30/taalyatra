import { Service } from '@angular/core';
import { type Observable, defaultIfEmpty, map } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ISiteVisibilityDto } from '@shared/interfaces/i-site-visibility';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { cacheLatest } from '@shared/utils/cache-latest.util';

/**
 * Supplies which home sections, inner pages and widgets are switched on (`site/visibility`).
 * The shell, the home page, link lists and route guards share one read.
 */
@Service()
export class SiteVisibilityService extends ApiBaseService<ISiteVisibilityDto> {
  private readonly visibility$: Observable<SiteVisibility> = this.attachViewDataHandler().pipe(
    // A missing or unreadable document shows everything: switching off is opt-in (ADR-0015).
    // It also means this stream always emits, so guards waiting on it never hang.
    defaultIfEmpty<ISiteVisibilityDto, ISiteVisibilityDto>({}),
    map((dto) => new SiteVisibility(dto)),
    cacheLatest(),
  );

  public override attachViewDataHandler(): Observable<ISiteVisibilityDto> {
    return this.attachViewApiHandler(ApiEndpoint.SiteVisibility);
  }

  /** @returns The switches; read once, then replayed to every subscriber. */
  public getVisibility(): Observable<SiteVisibility> {
    return this.visibility$;
  }
}
