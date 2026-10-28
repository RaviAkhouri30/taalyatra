import { Service } from '@angular/core';
import { EMPTY, type Observable, catchError, map, shareReplay, throwIfEmpty } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ISiteConfig, type ISiteConfigDto } from '@shared/interfaces/i-site-config';
import { SiteConfigModel } from '@shared/models/site-config.model';

/**
 * Supplies site-wide content (brand, contact details, social links, promotion) from
 * `site/config`. Many view models ask for it on every page, so they share one backend read.
 */
@Service()
export class SiteConfigService extends ApiBaseService<ISiteConfigDto> {
  // throwIfEmpty + shareReplay: a failed read completes without a value; turning that into an
  // error keeps shareReplay from caching it (errors reset it), so a later subscriber retries.
  // catchError then restores the "complete without emitting" behaviour views expect.
  private readonly siteConfig$: Observable<ISiteConfig> = this.attachViewDataHandler().pipe(
    map((dto) => new SiteConfigModel(dto)),
    throwIfEmpty(),
    shareReplay({ bufferSize: 1, refCount: false }),
    catchError(() => EMPTY),
  );

  public override attachViewDataHandler(): Observable<ISiteConfigDto> {
    return this.attachViewApiHandler(ApiEndpoint.SiteConfig);
  }

  /** @returns The site configuration; read once, then replayed to every subscriber. */
  public getSiteConfig(): Observable<ISiteConfig> {
    return this.siteConfig$;
  }
}
