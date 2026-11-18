import { InjectionToken } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { type IAfterLoadSource } from '@core/interfaces/i-vitals-reporter';

/** Loads the after-load code (speed report and visit) as its own chunk. */
export type AfterLoadLoader = (view: Window) => Observable<IAfterLoadSource>;

/**
 * A token, so the reporter's spec can swap in a fake source; beside the adapter because the dynamic
 * import must stay inside `core/backends`.
 */
export const AFTER_LOAD_LOADER = new InjectionToken<AfterLoadLoader>('AFTER_LOAD_LOADER', {
  providedIn: 'root',
  // The dynamic import is a Promise; defer() keeps it lazy and inside core/backends (§7).
  factory: () => (view) =>
    defer(() => import('./browser-after-load')).pipe(
      map((chunk) => new chunk.BrowserAfterLoad(view)),
    ),
});
