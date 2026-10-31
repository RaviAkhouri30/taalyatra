import { type Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { signedOutGuard } from './guards/signed-out.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { EDITOR_TAB_ROUTE_KEY, PUBLISH_PATH } from './models/editor-nav.constants';
import { EDITOR_TABS } from './schemas/editor-tabs';

/** Every admin page is on the bare layout, without the site's chrome. */
const ADMIN_TITLE_SUFFIX = 'Admin — Taal Yatra';

/**
 * Admin area (0006, 0008): sign-in pages, and the editor behind `adminGuard`. Each editor tab
 * is the same page component, told its tab through route data.
 */
const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-shell/admin-shell.component'),
    children: [
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
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/editor-layout/editor-layout.component'),
        children: [
          {
            path: '',
            title: ADMIN_TITLE_SUFFIX,
            loadComponent: () => import('./components/dashboard/dashboard.component'),
          },
          ...EDITOR_TABS.map((entry) => ({
            path: entry.tab,
            title: `${entry.label} — ${ADMIN_TITLE_SUFFIX}`,
            data: { [EDITOR_TAB_ROUTE_KEY]: entry.tab },
            canDeactivate: [unsavedChangesGuard],
            loadComponent: () => import('./components/editor-page/editor-page.component'),
          })),
          {
            path: PUBLISH_PATH,
            title: `Review & publish — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/publish-page/publish-page.component'),
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
