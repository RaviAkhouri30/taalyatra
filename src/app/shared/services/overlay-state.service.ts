import { Service, type Signal, signal } from '@angular/core';

/**
 * Whether a floating panel (the chat assistant) is open, so other floating chrome can step
 * aside: on phones the promo badge would otherwise sit, still focusable, under the panel.
 */
@Service()
export class OverlayStateService {
  private readonly open = signal(false);

  /** True while a floating panel is open. */
  public get panelOpen(): Signal<boolean> {
    return this.open.asReadonly();
  }

  /** Records whether the floating panel is open. */
  public setPanelOpen(open: boolean): void {
    this.open.set(open);
  }
}
