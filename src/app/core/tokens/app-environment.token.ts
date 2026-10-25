import { InjectionToken } from '@angular/core';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';
import { environment } from '@env/environment';

/** Build-time settings; override in tests with `{ provide: APP_ENVIRONMENT, useValue: … }`. */
export const APP_ENVIRONMENT = new InjectionToken<IAppEnvironment>('APP_ENVIRONMENT', {
  providedIn: 'root',
  factory: () => environment,
});
