import { type Routes } from '@angular/router';
import { provideFiles } from '@core/config/provide-files';
import { provideMedia } from '@core/config/provide-media';
import { editorGuard } from './guards/editor.guard';
import { editorTabGuard } from './guards/editor-tab.guard';
import { ownerGuard } from './guards/owner.guard';
import { signedOutGuard } from './guards/signed-out.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import {
  EDITOR_TAB_ROUTE_KEY,
  LEADS_LABEL,
  LEADS_PATH,
  MEDIA_LABEL,
  MEDIA_PATH,
  PUBLISH_PATH,
  RELEASES_LABEL,
  RELEASES_PATH,
  TEAM_ACCESS_LABEL,
  TEAM_ACCESS_PATH,
  VISITS_LABEL,
  VISITS_PATH,
} from './models/editor-nav.constants';
import { EditorTab } from './models/editor-tab.enum';
import { EDITOR_TABS } from './schemas/editor-tabs';
import { BackupService } from './services/backup.service';

/** Every admin page is on the bare layout, without the site's chrome. */
const ADMIN_TITLE_SUFFIX = 'Admin — Taal Yatra';

/**
 * Admin area (0006, 0008): sign-in pages, and the editor behind `editorGuard`, for the owner and
 * the managers they added (0019). Each editor tab is the same page component, told its tab through
 * route data; a manager only opens the tabs they can see, and never the owner's own pages.
 */
const adminRoutes: Routes = [
  {
    path: '',
    // Here and not with the other ports: public pages must never download the upload or backup
    // code (D9, 0016 V13).
    providers: [...provideMedia(), provideFiles(), BackupService],
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
        canActivate: [editorGuard],
        loadComponent: () => import('./components/editor-layout/editor-layout.component'),
        children: [
          {
            path: '',
            title: ADMIN_TITLE_SUFFIX,
            loadComponent: () => import('./components/dashboard/dashboard.component'),
          },
          // "Page content" was split into one tab per section (0017 U1); old links still land.
          { path: 'content', redirectTo: EditorTab.Hero, pathMatch: 'full' },
          ...EDITOR_TABS.map((entry) => ({
            path: entry.tab,
            title: `${entry.label} — ${ADMIN_TITLE_SUFFIX}`,
            data: { [EDITOR_TAB_ROUTE_KEY]: entry.tab },
            canActivate: [editorTabGuard],
            canDeactivate: [unsavedChangesGuard],
            loadComponent: () => import('./components/editor-page/editor-page.component'),
          })),
          {
            path: MEDIA_PATH,
            title: `${MEDIA_LABEL} — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/media-library/media-library.component'),
          },
          {
            path: PUBLISH_PATH,
            title: `Review & publish — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/publish-page/publish-page.component'),
          },
          {
            path: VISITS_PATH,
            canActivate: [ownerGuard],
            title: `${VISITS_LABEL} — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/visits-page/visits-page.component'),
          },
          {
            path: LEADS_PATH,
            canActivate: [ownerGuard],
            title: `${LEADS_LABEL} — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/leads-page/leads-page.component'),
          },
          {
            path: TEAM_ACCESS_PATH,
            canActivate: [ownerGuard],
            title: `${TEAM_ACCESS_LABEL} — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/team-access-page/team-access-page.component'),
          },
          {
            path: RELEASES_PATH,
            title: `${RELEASES_LABEL} — ${ADMIN_TITLE_SUFFIX}`,
            loadComponent: () => import('./components/releases/releases.component'),
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
