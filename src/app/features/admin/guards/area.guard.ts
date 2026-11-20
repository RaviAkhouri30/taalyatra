import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type ManagerArea } from '../models/manager-area.enum';
import { AccessService } from '../services/access.service';

/**
 * Opens one of the owner's areas (Leads, Visits) to the owner and to a manager given it (0022);
 * anyone else lands on the dashboard. The rules refuse the data to them anyway.
 * @param area The area the route belongs to.
 * @returns The route's guard.
 */
export function areaGuard(area: ManagerArea): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(AccessService).permissions$.pipe(
      take(1),
      map((permissions) => permissions.canUse(area) || router.parseUrl(AppRoute.Admin)),
    );
  };
}
