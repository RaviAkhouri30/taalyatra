import { InjectionToken } from '@angular/core';
import { DEFAULT_SITE_CONFIG } from '@shared/constants/site.constants';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';

/**
 * Site-wide content for the chrome. Defaults to the design's content; override it in
 * `app.config.ts` or in tests with `{ provide: SITE_CONFIG, useValue: … }`.
 */
export const SITE_CONFIG = new InjectionToken<ISiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_SITE_CONFIG,
});
