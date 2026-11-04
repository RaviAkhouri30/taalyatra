import { type Provider } from '@angular/core';
import { mediaServiceFactory } from '@core/factories/media-service.factory';
import { IMediaService } from '@core/interfaces/i-media-service';

/** @returns The `IMediaService` port's provider, for the admin routes only (D9). */
export function provideMedia(): Provider {
  return { provide: IMediaService, useFactory: mediaServiceFactory };
}
