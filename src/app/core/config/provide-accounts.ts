import { type Provider } from '@angular/core';
import { accountServiceFactory } from '@core/factories/account-service.factory';
import { IAccountService } from '@core/interfaces/i-account-service';

/**
 * @returns The `IAccountService` port's provider (0030), for the admin routes only, next to
 *   `provideMedia()`, which supplies their `HttpClient`. Public pages never load it.
 */
export function provideAccounts(): Provider[] {
  return [{ provide: IAccountService, useFactory: accountServiceFactory }];
}
