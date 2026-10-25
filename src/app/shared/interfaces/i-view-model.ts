import { type Signal } from '@angular/core';
import { type Observable } from 'rxjs';

/** Contract between a component and its view model (CLAUDE.md §3). */
export interface IViewModel<T> {
  /** Current view state; `undefined` until the first load completes. */
  readonly data: Signal<T | undefined>;
  /** Starts every stream the view model owns. Subscribed exactly once by `BaseComponent`. */
  init(): Observable<void>;
}
