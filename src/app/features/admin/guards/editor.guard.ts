import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { SignInReason } from '../models/sign-in-reason.enum';
import { AccessService } from '../services/access.service';

/**
 * Lets the owner and the managers they added into the editor (ADR-0012, 0019). Signed out →
 * sign-in page. Signed in with any other account → signed out, then sign-in page with
 * `reason=not-admin`. A check for the interface only: data is protected by `firestore.rules`.
 * @returns `true`, or where to go instead.
 */
export const editorGuard: CanActivateFn = () => {
  const auth = inject(IAuthService);
  const router = inject(Router);
  const refused = router.createUrlTree([AppRoute.AdminSignIn], {
    queryParams: { reason: SignInReason.NotAdmin },
  });
  return inject(AccessService).permissions$.pipe(
    take(1),
    switchMap((permissions) => {
      if (permissions.canEdit) {
        return of(true);
      }
      if (permissions.uid === '') {
        return of(router.parseUrl(AppRoute.AdminSignIn));
      }
      // Still send them away if signing out fails; they never see the admin area.
      return auth.signOut().pipe(
        map(() => refused),
        catchError(() => of(refused)),
      );
    }),
  );
};
