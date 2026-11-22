import { Service } from '@angular/core';
import { TitleStrategy } from '@angular/router';

/**
 * Leaves the browser tab's title to `SeoService` (0028). The router's default strategy sets the
 * route's title after `NavigationEnd`, so it would overwrite the owner's stored title, which
 * `SeoService` sets on `NavigationEnd`. The route's title still reaches `SeoService` as the
 * default, through `resolvePageMeta`.
 */
@Service()
export class SeoTitleStrategy extends TitleStrategy {
  /** Does nothing: `SeoService.describe()` sets the title for every navigation. */
  public override updateTitle(): void {
    // Intentionally empty: see the class comment.
  }
}
