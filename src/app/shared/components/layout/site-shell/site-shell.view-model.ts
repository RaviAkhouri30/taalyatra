import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { type Observable, combineLatest, defaultIfEmpty, filter, map, tap } from 'rxjs';
import { AnchorScrollService } from '@core/services/anchor-scroll.service';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { ViewModel } from '@shared/base/view-model';
import { LAYOUT_CHROME } from '@shared/constants/navigation.constants';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { type IShellState } from '@shared/interfaces/i-shell-state';
import { SiteConfigService } from '@shared/services/site-config.service';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';
import { SeoService } from '@shared/services/seo.service';
import { resolvePageLayout, resolvePageMeta } from '@shared/utils/route-layout.util';
import { applyVisibility } from '@shared/utils/visibility.util';

/**
 * Decides which chrome the current route gets (from its `layout` route data), supplies the site
 * content for it, and keeps the page's search and preview metadata in step (`SeoService`).
 */
@Injectable()
export class SiteShellViewModel extends ViewModel<IShellState> {
  public readonly site = computed(() => this.data()?.site ?? null);
  /**
   * False until the site config has arrived (or failed). `<main>` stays hidden until then, so the
   * header appearing above it can't shift the page (CLS). Sections still load meanwhile, and the
   * home sections arrive in the same read as the site config (ADR-0009), so this costs no wait.
   */
  public readonly settled = signal(false);
  /** Whether this visit previews the owner's unpublished changes. */
  public readonly preview = inject(APP_PREVIEW);
  /** Chrome for the current layout; `null` while loading or for bare (admin) routes. */
  public readonly chrome = computed<ILayoutChrome | null>(() => {
    const state = this.data();
    const chrome = state ? LAYOUT_CHROME[state.layout] : null;
    return state && chrome
      ? applyVisibility(chrome, state.visibility, state.site.promotion !== null)
      : null;
  });
  public readonly showUtilityBar = computed(() => this.isWidgetVisible(SiteWidget.UtilityBar));
  public readonly showActionBar = computed(
    () => this.chrome() !== null && this.isWidgetVisible(SiteWidget.ActionBar),
  );

  private readonly router = inject(Router);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly visibilityService = inject(SiteVisibilityService);
  private readonly anchorScroll = inject(AnchorScrollService);
  private readonly seo = inject(SeoService);

  /**
   * Waits for the first completed navigation before drawing any chrome, so the home page never
   * flashes the inner-page header while the router starts up.
   */
  protected override attachViewHandler(): Observable<unknown> {
    const navigation$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        const root = this.router.routerState.snapshot.root;
        return { layout: resolvePageLayout(root), page: resolvePageMeta(root, this.router.url) };
      }),
    );
    // defaultIfEmpty: a failed read completes empty; null still settles the shell, so the page is
    // shown without chrome rather than staying hidden.
    const site$ = this.siteConfigService.getSiteConfig().pipe(defaultIfEmpty(null));
    return combineLatest([site$, this.visibilityService.getVisibility(), navigation$]).pipe(
      tap(([site, visibility, { layout, page }]) => {
        if (site !== null) {
          this.setData({ site, layout, visibility });
          this.seo.describe(page, site);
        }
        this.settled.set(true);
      }),
    );
  }

  /** Scrolls to linked sections once they have rendered (they load their data asynchronously). */
  protected override attachCommandHandler(): Observable<unknown> {
    return this.anchorScroll.attachAnchorScrolling();
  }

  private isWidgetVisible(widget: SiteWidget): boolean {
    return this.data()?.visibility.isWidgetVisible(widget) ?? false;
  }
}
