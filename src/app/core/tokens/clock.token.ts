import { InjectionToken } from '@angular/core';
import { type IClock } from '@core/interfaces/i-clock';

/** The system clock; override in tests with `{ provide: CLOCK, useValue: { now: () => … } }`. */
export const CLOCK = new InjectionToken<IClock>('CLOCK', {
  providedIn: 'root',
  factory: () => ({ now: () => new Date() }),
});
