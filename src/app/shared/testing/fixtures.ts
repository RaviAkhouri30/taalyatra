import { type Provider } from '@angular/core';
import { of } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { LAYOUT_CHROME } from '@shared/constants/navigation.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { type ISiteConfigDto } from '@shared/interfaces/i-site-config';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SiteConfigService } from '@shared/services/site-config.service';

/** Test fixtures shared by specs (excluded from coverage), built from the fake database. */
export const SITE_DTO: ISiteConfigDto = fakeDb.site.config;
export const SITE = new SiteConfigModel(SITE_DTO);

/**
 * @param site The site configuration to serve; the fake database's by default.
 * @returns A `SiteConfigService` stand-in for specs that render the chrome without a backend.
 */
export function provideSiteConfig(site: SiteConfigModel = SITE): Provider {
  return { provide: SiteConfigService, useValue: { getSiteConfig: () => of(site) } };
}
export const HOME_CHROME = LAYOUT_CHROME[PageLayout.Home]!;
export const PAGE_CHROME = LAYOUT_CHROME[PageLayout.Page]!;

/** @returns All elements matching `selector` under `root`. */
export function queryAll(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

/** @returns Trimmed text of each element matching `selector`. */
export function texts(root: HTMLElement, selector: string): string[] {
  return queryAll(root, selector).map((element) => element.textContent.trim());
}
