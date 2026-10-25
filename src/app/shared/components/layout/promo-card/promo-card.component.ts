import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiyaIconComponent } from '@shared/components/diya-icon/diya-icon.component';
import { CARD_DIYA, CARD_PROMO_SPARKS } from '@shared/constants/promo.constants';
import { type IPromotion } from '@shared/interfaces/i-promotion';

/** Card-style promo badge (presentational). Owned by `PromoBadgeComponent`. */
@Component({
  selector: 'app-promo-card',
  imports: [DiyaIconComponent, RouterLink],
  templateUrl: './promo-card.component.html',
  styleUrl: './promo-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoCardComponent {
  public readonly promotion = input.required<IPromotion>();
  /** Emits when the visitor closes the badge. */
  public readonly dismiss = output();

  protected readonly diya = CARD_DIYA;
  protected readonly sparks = CARD_PROMO_SPARKS;
}
