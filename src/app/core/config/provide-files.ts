import { type Provider } from '@angular/core';
import { fileServiceFactory } from '@core/factories/file-service.factory';
import { IFileService } from '@core/interfaces/i-file-service';

/** @returns The `IFileService` port's provider, for the admin routes only (backups, 0016 V13). */
export function provideFiles(): Provider {
  return { provide: IFileService, useFactory: fileServiceFactory };
}
