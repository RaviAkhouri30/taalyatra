import { type Signal, signal } from '@angular/core';
import { EMPTY, type Observable, map, merge } from 'rxjs';
import { type IViewModel } from '@shared/interfaces/i-view-model';

/**
 * Base class for every view model (CLAUDE.md §3).
 *
 * Holds the view state in a signal and exposes one `init()` stream that merges data loading
 * (`attachViewHandler`) with user-command handling (`attachCommandHandler`).
 * @template T Shape of the view state.
 */
export abstract class ViewModel<T> implements IViewModel<T> {
  /** Read-only view state for templates. */
  public readonly data: Signal<T | undefined>;

  private readonly state = signal<T | undefined>(undefined);

  public constructor() {
    // Assigned here because field initialisers run in declaration order.
    this.data = this.state.asReadonly();
  }

  /** @returns A stream that runs every handler; subscribed once by `BaseComponent`. */
  public init(): Observable<void> {
    return merge(this.attachViewHandler(), this.attachCommandHandler()).pipe(map(() => undefined));
  }

  /** Loads view data. Override in concrete view models. */
  protected attachViewHandler(): Observable<unknown> {
    return EMPTY;
  }

  /** Reacts to user commands. Override when the view model handles any. */
  protected attachCommandHandler(): Observable<unknown> {
    return EMPTY;
  }

  /** Replaces the view state. */
  protected setData(value: T): void {
    this.state.set(value);
  }

  /** Derives the next view state from the current one. */
  protected updateData(update: (current: T | undefined) => T): void {
    this.state.update(update);
  }
}
