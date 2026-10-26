import { InjectionToken } from '@angular/core';

/** Current time in milliseconds; replace in tests to control time. */
export const NOW = new InjectionToken<() => number>('NOW', {
  providedIn: 'root',
  factory: () => Date.now,
});
