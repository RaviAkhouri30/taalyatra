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
  // Pages not built yet (Shows, Videos, Team, Achievements, Admin) fall back to home for now.
  { path: '**', redirectTo: '' },
];
