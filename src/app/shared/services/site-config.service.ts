import { Service } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ISiteConfig, type ISiteConfigDto } from '@shared/interfaces/i-site-config';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { cacheLatest } from '@shared/utils/cache-latest.util';

/**
 * Supplies site-wide content (brand, contact details, social links, promotion, shared labels,
 * credit) from `site/config`. Many view models ask for it on every page; they share one read.
 */
@Service()
export class SiteConfigService extends ApiBaseService<ISiteConfigDto> {
  private readonly siteConfig$: Observable<ISiteConfig> = this.attachViewDataHandler().pipe(
    map((dto) => new SiteConfigModel(dto)),
    cacheLatest(),
  );

  public override attachViewDataHandler(): Observable<ISiteConfigDto> {
    return this.attachViewApiHandler(ApiEndpoint.SiteConfig);
  }

  /** @returns The site configuration; read once, then replayed to every subscriber. */
  public getSiteConfig(): Observable<ISiteConfig> {
    return this.siteConfig$;
  }
}
