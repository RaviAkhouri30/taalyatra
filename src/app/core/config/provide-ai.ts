import { type Provider } from '@angular/core';
import { aiServiceFactory } from '@core/factories/ai-service.factory';
import { IAiService } from '@core/interfaces/i-ai-service';

/**
 * @returns The `IAiService` port's provider (0025), for the admin routes only, next to
 *   `provideMedia()`, which supplies their `HttpClient`. Public pages never load it.
 */
export function provideAi(): Provider[] {
  return [{ provide: IAiService, useFactory: aiServiceFactory }];
}
