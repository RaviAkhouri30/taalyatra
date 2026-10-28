import { type Routes } from '@angular/router';

/** Achievements feature: one page, lazy-loaded from `app.routes.ts`. */
const achievementsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/achievements-page/achievements-page.component'),
  },
];

export default achievementsRoutes;
