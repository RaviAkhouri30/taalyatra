import { inject } from '@angular/core';
import { FakeAccountService } from '@core/backends/fake/fake-account.service';
import { FirebaseAccountService } from '@core/backends/firebase/firebase-account.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IAccountService } from '@core/interfaces/i-account-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the account adapter (0030): Firebase's sign-up API for a Firebase build (the emulator's
 * for the emulator build), the Fake otherwise.
 *
 * @returns The active account adapter.
 */
export function accountServiceFactory(): IAccountService {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new FirebaseAccountService()
    : new FakeAccountService();
}
