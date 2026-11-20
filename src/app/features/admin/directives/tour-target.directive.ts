import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';
import { type TourTarget } from '../models/tour.model';
import { TourService } from '../services/tour.service';

/**
 * Marks an area the guided tour can point at (0020 V9), and tells the tour while it's on the page,
 * so nothing has to search the page for it.
 */
@Directive({ selector: '[appTourTarget]' })
export class TourTargetDirective {
  /** The area this element is; `null` when it's none (e.g. most menu links). */
  public readonly appTourTarget = input.required<TourTarget | null>();

  private readonly tour = inject(TourService, { optional: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public constructor() {
    let current: TourTarget | null = null;
    // The area can change (a menu link's target is bound), so the registration follows it.
    effect(() => {
      const target = this.appTourTarget();
      if (current) {
        this.tour?.unregister(current, this.element);
      }
      current = target;
      if (target) {
        this.tour?.register(target, this.element);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      if (current) {
        this.tour?.unregister(current, this.element);
      }
    });
  }
}
