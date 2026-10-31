import { type Routes } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { pageEnabledGuard } from '@shared/guards/page-enabled.guard';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6), which keeps
 * route definitions free of Promise chaining.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Taal Yatra — Drum circles and music workshops in Pune',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Home,
      [ROUTE_DATA_KEYS.Description]:
        'Drum circles, music workshops and live shows for teams, families and festivals in Pune. Request a proposal in minutes.',
    },
    loadComponent: () => import('@features/home/home-page.component'),
  },
  {
    path: 'videos',
    title: 'Videos — Taal Yatra',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Page,
      [ROUTE_DATA_KEYS.Description]:
        'Watch Taal Yatra drum circles, workshops and shows: corporate days, family functions and festivals in Pune.',
    },
    canMatch: [pageEnabledGuard(SitePage.Videos)],
    loadChildren: () => import('@features/videos/videos.routes'),
  },
  {
    path: 'team',
    title: 'Our team — Taal Yatra',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Page,
      [ROUTE_DATA_KEYS.Description]:
        'Meet the facilitators, percussionists and event makers behind Taal Yatra drum circles in Pune.',
    },
    canMatch: [pageEnabledGuard(SitePage.Team)],
    loadChildren: () => import('@features/team/team.routes'),
  },
  {
    path: 'shows',
    title: 'Shows & performances — Taal Yatra',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Page,
      [ROUTE_DATA_KEYS.Description]:
        'Live band, percussion ensemble, acoustic, fusion, dhol procession and classical tabla shows for your event in Pune.',
    },
    canMatch: [pageEnabledGuard(SitePage.Shows)],
    loadChildren: () => import('@features/shows/shows.routes'),
  },
  {
    path: 'achievements',
    title: 'Achievements — Taal Yatra',
    data: {
      [ROUTE_DATA_KEYS.Layout]: PageLayout.Page,
      [ROUTE_DATA_KEYS.Description]:
        'Milestones, awards, press and notable performances from Taal Yatra’s years of stages, students and sound.',
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
