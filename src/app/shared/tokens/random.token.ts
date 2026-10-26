import { InjectionToken } from '@angular/core';

/** Source of randomness in [0, 1); replace in tests for deterministic sequences. */
export const RANDOM = new InjectionToken<() => number>('RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});
