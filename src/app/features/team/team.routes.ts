import { type Routes } from '@angular/router';

/** Team feature: one page, lazy-loaded from `app.routes.ts`. */
const teamRoutes: Routes = [
  { path: '', loadComponent: () => import('./components/team-page/team-page.component') },
];

export default teamRoutes;
