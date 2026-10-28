import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { AppRoute } from '@shared/enums/app-route.enum';

/**
 * Sends an admin who is already signed in from the sign-in page straight to the admin home.
 * @returns `true`, or the admin home.
 */
export const signedOutGuard: CanActivateFn = () => {
  const router = inject(Router);
  const adminUid = inject(APP_ENVIRONMENT).adminUid;
  return inject(IAuthService).user$.pipe(
    take(1),
    map((user) => (user?.uid === adminUid ? router.parseUrl(AppRoute.Admin) : true)),
  );
};
