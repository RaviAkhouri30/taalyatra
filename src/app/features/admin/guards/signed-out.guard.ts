import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AppRoute } from '@shared/enums/app-route.enum';
import { AccessService } from '../services/access.service';

/**
 * Sends someone already signed in with access (the owner or a manager) from the sign-in page
 * straight to the admin home.
 * @returns `true`, or the admin home.
 */
export const signedOutGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AccessService).permissions$.pipe(
    take(1),
    map((permissions) => (permissions.canEdit ? router.parseUrl(AppRoute.Admin) : true)),
  );
};
