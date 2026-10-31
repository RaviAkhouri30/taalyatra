import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type SitePage } from '@shared/enums/site-page.enum';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';

/**
 * Keeps visitors out of an inner page the owner switched off, sending them to the home page.
 * `canMatch` rather than `canActivate`, so a switched-off page's chunk is never downloaded.
 *
 * @param page The inner page the route shows.
 * @returns A guard for that route.
 */
export function pageEnabledGuard(page: SitePage): CanMatchFn {
  return () => {
    const router = inject(Router);
    // take(1): the switches are read once per visit; the stream always emits (all visible when
    // the document is missing), so navigation never waits forever.
    return inject(SiteVisibilityService)
      .getVisibility()
      .pipe(
        take(1),
        map((visibility) => visibility.isPageVisible(page) || router.parseUrl(AppRoute.Home)),
      );
  };
}
