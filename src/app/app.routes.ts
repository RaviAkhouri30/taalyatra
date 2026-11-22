import { type Routes } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { SeoPage } from '@shared/enums/seo-page.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { pageEnabledGuard } from '@shared/guards/page-enabled.guard';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6), which keeps
 * route definitions free of Promise chaining. A public page names its `SeoPage`: its title and
 * description come from `PAGE_META`, or from the owner's own (0028).
 */
export const routes: Routes = [
  {
    path: '',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Home, [ROUTE_DATA_KEYS.Seo]: SeoPage.Home },
    loadComponent: () => import('@features/home/home-page.component'),
  },
  {
    path: 'videos',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page, [ROUTE_DATA_KEYS.Seo]: SeoPage.Videos },
    canMatch: [pageEnabledGuard(SitePage.Videos)],
    loadChildren: () => import('@features/videos/videos.routes'),
  },
  {
    path: 'team',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page, [ROUTE_DATA_KEYS.Seo]: SeoPage.Team },
    canMatch: [pageEnabledGuard(SitePage.Team)],
    loadChildren: () => import('@features/team/team.routes'),
  },
  {
    path: 'shows',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page, [ROUTE_DATA_KEYS.Seo]: SeoPage.Shows },
    canMatch: [pageEnabledGuard(SitePage.Shows)],
    loadChildren: () => import('@features/shows/shows.routes'),
  },
  {
    path: 'achievements',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Page,
      [ROUTE_DATA_KEYS.Seo]: SeoPage.Achievements,
    },
    canMatch: [pageEnabledGuard(SitePage.Achievements)],
    loadChildren: () => import('@features/achievements/achievements.routes'),
  },
  {
    path: 'admin',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Bare },
    loadChildren: () => import('@features/admin/admin.routes'),
  },
  { path: '**', redirectTo: '' },
];
