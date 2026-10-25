import { DestroyRef, Directive, type OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type IViewModel } from '@shared/interfaces/i-view-model';

/**
 * Base class for container components that own a view model.
 *
 * Subscribes to the view model's `init()` stream once, and unsubscribes automatically when the
 * component is destroyed. This is the only subscription allowed in the view layer.
 * @template T Shape of the view model's state.
 */
@Directive()
export abstract class BaseComponent<T> implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** The component's view model, injected by the concrete component. */
  protected abstract readonly model: IViewModel<T>;

  public ngOnInit(): void {
    this.model.init().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
