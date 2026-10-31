import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { type Provider } from '@angular/core';
import { of } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { LAYOUT_CHROME } from '@shared/constants/navigation.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { type ISiteConfigDto } from '@shared/interfaces/i-site-config';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';

/** Test fixtures shared by specs (excluded from coverage), built from the fake database. */
export const SITE_DTO: ISiteConfigDto = fakeDb.site.config;
export const SITE = new SiteConfigModel(SITE_DTO);
export const VIDEOS_FIXTURE = fakeDb.videos;
export const TEAM_FIXTURE = fakeDb.team;
export const SHOW_FORMATS_FIXTURE = fakeDb.showFormats;
export const PAGES = fakeDb.pages;

/**
 * @param site The site configuration to serve; the fake database's by default.
 * @returns A `SiteConfigService` stand-in for specs that render the chrome without a backend.
 */
export function provideSiteConfig(site: SiteConfigModel = SITE): Provider {
  return { provide: SiteConfigService, useValue: { getSiteConfig: () => of(site) } };
}

/**
 * @param visibility The switches to serve; everything shown by default.
 * @returns A `SiteVisibilityService` stand-in for specs that render the chrome without a backend.
 */
export function provideVisibility(
  visibility: SiteVisibility = SiteVisibility.allVisible,
): Provider {
  return { provide: SiteVisibilityService, useValue: { getVisibility: () => of(visibility) } };
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

/** @returns The fake database's value at a slash-separated path, or `undefined`. */
function resolveFakePath(path: string): unknown {
  return path
    .split('/')
    .filter((segment) => segment.length > 0)
    .reduce<unknown>(
      (node, segment) =>
        typeof node === 'object' && node !== null
          ? new Map(Object.entries(node)).get(segment)
          : undefined,
      fakeDb,
    );
}

/**
 * A synchronous `IHttpBackend` that answers every read from `fake-db.json` (404 when missing), for
 * specs that render whole pages. Returns the provider and its `get` spy.
 */
export function provideFakeContent(): { provider: Provider; get: ReturnType<typeof vi.fn> } {
  const get = vi.fn((path: string) => {
    const body = resolveFakePath(path);
    return of(
      body === undefined
        ? new HttpResponse({ status: HttpStatusCode.NotFound })
        : new HttpResponse({ status: HttpStatusCode.Ok, body }),
    );
  });
  return { provider: { provide: IHttpBackend, useValue: { get } }, get };
}
