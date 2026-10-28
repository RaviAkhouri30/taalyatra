import { type Routes } from '@angular/router';

/** Videos feature: one page, lazy-loaded from `app.routes.ts`. */
const videosRoutes: Routes = [
  { path: '', loadComponent: () => import('./components/videos-page/videos-page.component') },
];

export default videosRoutes;
