import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TOUR_VERSION } from '../models/tour.constants';
import { type ITourStep, type TourTarget, tourSeenKey, tourSteps } from '../models/tour.model';
import { AccessService } from './access.service';
import { DeviceStoreService } from './device-store.service';

/**
 * The guided tour's state (0020 V9), shared by the offer, the Help menu, the areas it points at
 * and the overlay. Provided by the editor layout, like `EditorNavService`.
 */
@Injectable()
export class TourService {
  /** The step showing, or `null` when the tour isn't running. */
  public readonly step = computed(() =>
    this.running() ? (this.steps().at(this.index()) ?? null) : null,
  );
  /** "Step 3 of 8". */
  public readonly progress = computed(
    () => `Step ${String(this.index() + 1)} of ${String(this.steps().length)}`,
  );
  public readonly isFirst = computed(() => this.index() === 0);
  public readonly isLast = computed(() => this.index() === this.steps().length - 1);
  /** The element the step points at, once its page has drawn it; `null` for none. */
  public readonly element = computed(() => {
    const target = this.step()?.target;
    return target ? (this.targets().get(target) ?? null) : null;
  });
  /** Whether to offer the tour: signed in, and this device hasn't asked this account yet. */
  public readonly offerOpen = computed(() => {
    const permissions = this.permissions();
    return (
      permissions !== undefined &&
      permissions.canEdit &&
      !this.answered() &&
      !this.running() &&
      this.store.get(tourSeenKey(permissions.uid)) !== TOUR_VERSION
    );
  });

  private readonly router = inject(Router);
  private readonly store = inject(DeviceStoreService);
  private readonly permissions = toSignal(inject(AccessService).permissions$);
  private readonly running = signal(false);
  private readonly index = signal(0);
  private readonly steps = signal<readonly ITourStep[]>([]);
  /** The offer was answered in this session (the device remembers it for next time). */
  private readonly answered = signal(false);
  private readonly targets = signal<ReadonlyMap<TourTarget, HTMLElement>>(new Map());

  /** Starts the tour from its first step, and stops offering it. */
  public start(): void {
    const permissions = this.permissions();
    if (permissions === undefined) {
      return;
    }
    this.remember();
    this.steps.set(tourSteps(permissions));
    this.index.set(0);
    this.running.set(true);
    this.open();
  }

  /** Answers the offer with "Not now": it isn't offered again on this device. */
  public decline(): void {
    this.remember();
  }

  public next(): void {
    if (this.isLast()) {
      this.close();
      return;
    }
    this.index.update((index) => index + 1);
    this.open();
  }

  public back(): void {
    if (!this.isFirst()) {
      this.index.update((index) => index - 1);
      this.open();
    }
  }

  public close(): void {
    this.running.set(false);
  }

  /**
   * @param target The area an element shows.
   * @param element The element, while it's on the page.
   */
  public register(target: TourTarget, element: HTMLElement): void {
    this.targets.update((targets) => new Map(targets).set(target, element));
  }

  /**
   * @param target The area.
   * @param element The element leaving the page; a newer one for the same area is kept.
   */
  public unregister(target: TourTarget, element: HTMLElement): void {
    if (this.targets().get(target) === element) {
      this.targets.update((targets) => {
        const next = new Map(targets);
        next.delete(target);
        return next;
      });
    }
  }

  /** Opens the step's page when it's another; its area registers itself once drawn. */
  private open(): void {
    const step = this.step();
    const current = this.router.url.split(/[?#]/u)[0];
    if (step && current !== step.url) {
      // The navigation's result isn't needed: a step without its area is shown on its own.
      void this.router.navigateByUrl(step.url);
    }
  }

  private remember(): void {
    const permissions = this.permissions();
    this.answered.set(true);
    if (permissions) {
      this.store.set(tourSeenKey(permissions.uid), TOUR_VERSION);
    }
  }
}
