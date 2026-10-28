import { type Routes } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6), which keeps
 * route definitions free of Promise chaining.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Taal Yatra — Drum circles and music workshops in Pune',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Home },
    loadComponent: () => import('@features/home/home-page.component'),
  },
  {
    path: 'videos',
    title: 'Videos — Taal Yatra',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page },
    loadChildren: () => import('@features/videos/videos.routes'),
  },
  {
    path: 'team',
    title: 'Our team — Taal Yatra',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page },
    loadChildren: () => import('@features/team/team.routes'),
  },
  {
    path: 'shows',
    title: 'Shows & performances — Taal Yatra',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page },
    loadChildren: () => import('@features/shows/shows.routes'),
  },
  {
    path: 'achievements',
    title: 'Achievements — Taal Yatra',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Page },
    loadChildren: () => import('@features/achievements/achievements.routes'),
  },
  {
    path: 'admin',
    data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Bare },
    loadChildren: () => import('@features/admin/admin.routes'),
  },
  { path: '**', redirectTo: '' },
];
