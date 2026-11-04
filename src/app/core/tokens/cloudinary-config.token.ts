import { InjectionToken, inject } from '@angular/core';
import { APP_ENVIRONMENT } from './app-environment.token';

/** Cloudinary's public settings. The API key and secret live only in the upload function. */
export const CLOUDINARY_CONFIG = new InjectionToken<{ readonly cloudName: string }>(
  'CLOUDINARY_CONFIG',
  { providedIn: 'root', factory: () => inject(APP_ENVIRONMENT).cloudinary },
);
