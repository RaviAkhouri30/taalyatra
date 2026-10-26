import { Injectable, computed, inject } from '@angular/core';
import { ViewModel } from '@shared/base/view-model';
import { type IPromoState } from '@shared/interfaces/i-ui-state';
import { OverlayStateService } from '@shared/services/overlay-state.service';

/**
 * Tracks whether the visitor dismissed the promo badge. The badge lives in the persistent site
 * shell, so a dismissal holds while the visitor moves between pages.
 */
@Injectable()
export class PromoBadgeViewModel extends ViewModel<IPromoState> {
  public readonly dismissed = computed(() => this.data()?.dismissed ?? false);
  /** True while a floating panel covers the badge's corner; the badge steps aside. */
  public readonly covered = inject(OverlayStateService).panelOpen;

  public constructor() {
    super();
    this.setData({ dismissed: false });
  }

  public dismiss(): void {
    this.setData({ dismissed: true });
  }
}
