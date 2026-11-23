import { inject } from '@angular/core';
import { type Observable, delay, of, throwError } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { AccountError, type IAccountService } from '@core/interfaces/i-account-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import {
  FAKE_ADMIN_ACCOUNT,
  FAKE_MANAGER_ACCOUNT,
  FAKE_SUPER_MANAGER_ACCOUNT,
  FAKE_VISITOR_ACCOUNT,
} from './fake-auth.constants';

/** The Fake's accounts, which can't be made again. */
const TAKEN: ReadonlySet<string> = new Set(
  [FAKE_ADMIN_ACCOUNT, FAKE_VISITOR_ACCOUNT, FAKE_MANAGER_ACCOUNT, FAKE_SUPER_MANAGER_ACCOUNT].map(
    (account) => account.email,
  ),
);

/**
 * Accounts for development and the e2e suite (0030): any new email gets an id made from it; the
 * Fake's own accounts are already taken.
 */
export class FakeAccountService implements IAccountService {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  public create(email: string): Observable<string> {
    const address = email.trim().toLowerCase();
    return TAKEN.has(address)
      ? throwError(() => new AccountError(AccountErrorKind.EmailTaken))
      : of(`fake-${address.replace(/[^a-z0-9]/gu, '-')}`).pipe(delay(this.latencyMs));
  }
}
