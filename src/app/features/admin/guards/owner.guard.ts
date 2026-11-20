import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AppRoute } from '@shared/enums/app-route.enum';
import { AccessService } from '../services/access.service';

/**
 * Keeps Team access to the owner (0019 decision 6; Leads and Visits use `areaGuard` since 2.3.0); a
 * manager lands on the dashboard instead. The rules refuse the data to anyone else anyway.
 * @returns `true`, or the dashboard.
 */
export const ownerGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AccessService).permissions$.pipe(
    take(1),
    map((permissions) => permissions.isOwner || router.parseUrl(AppRoute.Admin)),
  );
};
