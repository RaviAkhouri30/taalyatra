import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AppRoute } from '@shared/enums/app-route.enum';
import { routeTab } from '../models/editor-nav.constants';
import { AccessService } from '../services/access.service';

/**
 * Keeps a manager out of the editor pages the owner hid from them (0019); they land on the
 * dashboard instead. The rules refuse those pages' drafts anyway.
 * @param route The editor page's route, which names its tab in its data.
 * @returns `true`, or the dashboard.
 */
export const editorTabGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const tab = routeTab(route.data);
  return inject(AccessService).permissions$.pipe(
    take(1),
    map((permissions) => permissions.canSee(tab) || router.parseUrl(AppRoute.Admin)),
  );
};
