import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { AppRoute } from '@shared/enums/app-route.enum';
import { SignInReason } from '../models/sign-in-reason.enum';

/**
 * Lets only the admin account in (ADR-0012). Signed out → sign-in page. Signed in with another
 * account → signed out, then sign-in page with `reason=not-admin`. A check for the interface only:
 * data is protected by `firestore.rules`.
 * @returns `true`, or where to go instead.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(IAuthService);
  const router = inject(Router);
  const adminUid = inject(APP_ENVIRONMENT).adminUid;
  const signIn = router.parseUrl(AppRoute.AdminSignIn);
  const refused = router.createUrlTree([AppRoute.AdminSignIn], {
    queryParams: { reason: SignInReason.NotAdmin },
  });
  return auth.user$.pipe(
    take(1),
    switchMap((user) => {
      if (user === null) {
        return of(signIn);
      }
      if (user.uid === adminUid) {
        return of(true);
      }
      // Still send them away if signing out fails; they never see the admin area.
      return auth.signOut().pipe(
        map(() => refused),
        catchError(() => of(refused)),
      );
    }),
  );
};
