import { Injectable, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { type Observable, combineLatest, distinctUntilChanged, filter, map, tap } from 'rxjs';
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
  /** Chrome for the current layout; `null` while loading or for bare (admin) routes. */
  public readonly chrome = computed<ILayoutChrome | null>(() => {
    const state = this.data();
    return state ? LAYOUT_CHROME[state.layout] : null;
  });

  private readonly router = inject(Router);
  private readonly siteConfigService = inject(SiteConfigService);

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
    return combineLatest([this.siteConfigService.getSiteConfig(), layout$]).pipe(
      tap(([site, layout]) => {
        this.setData({ site, layout });
      }),
    );
  }
}
