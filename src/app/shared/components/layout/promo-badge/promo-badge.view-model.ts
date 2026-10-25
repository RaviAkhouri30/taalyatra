import { Injectable, computed } from '@angular/core';
import { ViewModel } from '@shared/base/view-model';
import { type IPromoState } from '@shared/interfaces/i-ui-state';

/**
 * Tracks whether the visitor dismissed the promo badge. The badge lives in the persistent site
 * shell, so a dismissal holds while the visitor moves between pages.
 */
@Injectable()
export class PromoBadgeViewModel extends ViewModel<IPromoState> {
  public readonly dismissed = computed(() => this.data()?.dismissed ?? false);

  public constructor() {
    super();
    this.setData({ dismissed: false });
  }

  public dismiss(): void {
    this.setData({ dismissed: true });
  }
}
