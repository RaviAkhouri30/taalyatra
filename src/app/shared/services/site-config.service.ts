import { Service, inject } from '@angular/core';
import { type Observable, of } from 'rxjs';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { SITE_CONFIG } from '@shared/tokens/site-config.token';

/**
 * Supplies site-wide content as a stream.
 *
 * Today it emits the injected `SITE_CONFIG`; once the admin area saves content, it will read from
 * `IHttpBackend` instead. Consumers already treat it as asynchronous, so that swap needs no change
 * elsewhere (Dependency Inversion).
 */
@Service()
export class SiteConfigService {
  private readonly config = inject(SITE_CONFIG);

  /** @returns The current site configuration. */
  public getSiteConfig(): Observable<ISiteConfig> {
    return of(this.config);
  }
}
