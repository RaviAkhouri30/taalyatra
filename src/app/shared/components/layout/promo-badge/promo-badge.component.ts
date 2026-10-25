import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { PromoCardComponent } from '@shared/components/layout/promo-card/promo-card.component';
import { PromoPillComponent } from '@shared/components/layout/promo-pill/promo-pill.component';
import { PromoVariant } from '@shared/enums/variant.enums';
import { type IPromotion } from '@shared/interfaces/i-promotion';
import { type IPromoState } from '@shared/interfaces/i-ui-state';
import { PromoBadgeViewModel } from './promo-badge.view-model';

/** Floating offer badge: shows the pill or card style until the visitor dismisses it. */
@Component({
  selector: 'app-promo-badge',
  imports: [PromoCardComponent, PromoPillComponent],
  templateUrl: './promo-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PromoBadgeViewModel],
})
export class PromoBadgeComponent extends BaseComponent<IPromoState> {
  public readonly promotion = input.required<IPromotion>();
  public readonly variant = input<PromoVariant>(PromoVariant.Card);

  protected override readonly model = inject(PromoBadgeViewModel);
  protected readonly isPill = computed(() => this.variant() === PromoVariant.Pill);
}
