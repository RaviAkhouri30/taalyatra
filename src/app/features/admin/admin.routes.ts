import { type Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { signedOutGuard } from './guards/signed-out.guard';

/** Admin area (bare layout, from `app.routes.ts`): home behind the guard, sign-in, reset. */
const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-shell/admin-shell.component'),
    children: [
      {
        path: '',
        title: 'Admin — Taal Yatra',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/admin-home/admin-home.component'),
      },
      {
        path: 'sign-in',
        title: 'Admin sign in — Taal Yatra',
        canActivate: [signedOutGuard],
        loadComponent: () => import('./components/sign-in/sign-in.component'),
      },
      {
        path: 'reset-password',
        title: 'Reset password — Taal Yatra',
        loadComponent: () => import('./components/reset-password/reset-password.component'),
      },
    ],
  },
];

export default adminRoutes;
