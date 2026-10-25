import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiyaIconComponent } from '@shared/components/diya-icon/diya-icon.component';
import { PILL_DIYA, PILL_PROMO_SPARKS } from '@shared/constants/promo.constants';
import { type IPromotion } from '@shared/interfaces/i-promotion';

/** Pill-style promo badge (presentational). Owned by `PromoBadgeComponent`. */
@Component({
  selector: 'app-promo-pill',
  imports: [DiyaIconComponent, RouterLink],
  templateUrl: './promo-pill.component.html',
  styleUrl: './promo-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoPillComponent {
  public readonly promotion = input.required<IPromotion>();
  /** Emits when the visitor closes the badge. */
  public readonly dismiss = output();

  protected readonly diya = PILL_DIYA;
  protected readonly sparks = PILL_PROMO_SPARKS;
}
