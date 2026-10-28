import { inject } from '@angular/core';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { FirebaseAuthService } from '@core/backends/firebase/firebase-auth.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the auth adapter: Firebase when the data backend is Firebase, the fake one otherwise
 * (development and the deterministic e2e suite).
 * @returns The active auth adapter.
 */
export function authServiceFactory(): IAuthService {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new FirebaseAuthService()
    : new FakeAuthService();
}
