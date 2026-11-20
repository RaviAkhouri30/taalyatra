import { InjectionToken } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { type IRootStyle } from '@core/interfaces/i-root-style';

/** Loads the theme's chunk and gives back its function from a stored document to the page's style. */
export type SiteThemeLoader = () => Observable<(dto: unknown, preview?: boolean) => IRootStyle>;

/**
 * A token, so the service's spec can swap in a fake chunk. It lives in `shared`, not `core/tokens`,
 * because the chunk is shared code and `core` never depends on `shared`.
 */
export const SITE_THEME_LOADER = new InjectionToken<SiteThemeLoader>('SITE_THEME_LOADER', {
  providedIn: 'root',
  // The dynamic import is a Promise; defer() keeps it lazy until a stored theme needs it (§7).
  factory: () => () =>
    defer(() => import('@shared/models/site-theme-style')).pipe(
      map((chunk) => chunk.themeStyleFor),
    ),
});
