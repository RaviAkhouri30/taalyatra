import { InjectionToken } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { type IVitalsSource } from '@core/interfaces/i-vitals-reporter';

/** Loads the measuring code as its own chunk. */
export type VitalsSourceLoader = (view: Window) => Observable<IVitalsSource>;

/**
 * A token, so the reporter's spec can swap in a fake source; beside the adapter because the dynamic
 * import must stay inside `core/backends`.
 */
export const VITALS_SOURCE_LOADER = new InjectionToken<VitalsSourceLoader>('VITALS_SOURCE_LOADER', {
  providedIn: 'root',
  // The dynamic import is a Promise; defer() keeps it lazy and inside core/backends (§7).
  factory: () => (view) =>
    defer(() => import('./browser-vitals-source')).pipe(
      map((chunk) => new chunk.BrowserVitalsSource(view)),
    ),
});
