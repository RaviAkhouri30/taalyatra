import { type Routes } from '@angular/router';

/** Shows feature: one page, lazy-loaded from `app.routes.ts`. */
const showsRoutes: Routes = [
  { path: '', loadComponent: () => import('./components/shows-page/shows-page.component') },
];

export default showsRoutes;
