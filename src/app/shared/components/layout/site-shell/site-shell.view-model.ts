import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  type Observable,
  combineLatest,
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs';
import { AnchorScrollService } from '@core/services/anchor-scroll.service';
import { ViewModel } from '@shared/base/view-model';
import { LAYOUT_CHROME } from '@shared/constants/navigation.constants';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { type IShellState } from '@shared/interfaces/i-shell-state';
import { SiteConfigService } from '@shared/services/site-config.service';
import { resolvePageLayout } from '@shared/utils/route-layout.util';

/**
 * Decides which chrome the current route gets (from its `layout` route data) and supplies the
 * site content for it.
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
  /** Chrome for the current layout; `null` while loading or for bare (admin) routes. */
  public readonly chrome = computed<ILayoutChrome | null>(() => {
    const state = this.data();
    return state ? LAYOUT_CHROME[state.layout] : null;
  });

  private readonly router = inject(Router);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly anchorScroll = inject(AnchorScrollService);

  /**
   * Waits for the first completed navigation before drawing any chrome, so the home page never
   * flashes the inner-page header while the router starts up.
   */
  protected override attachViewHandler(): Observable<unknown> {
    const layout$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => resolvePageLayout(this.router.routerState.snapshot.root)),
      distinctUntilChanged(),
    );
    // defaultIfEmpty: a failed read completes empty; null still settles the shell, so the page is
    // shown without chrome rather than staying hidden.
    const site$ = this.siteConfigService.getSiteConfig().pipe(defaultIfEmpty(null));
    return combineLatest([site$, layout$]).pipe(
      tap(([site, layout]) => {
        if (site !== null) {
          this.setData({ site, layout });
        }
        this.settled.set(true);
      }),
    );
  }

  /** Scrolls to linked sections once they have rendered (they load their data asynchronously). */
  protected override attachCommandHandler(): Observable<unknown> {
    return this.anchorScroll.attachAnchorScrolling();
  }
}
