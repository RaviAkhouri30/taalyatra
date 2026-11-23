import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FestivalIconComponent } from '@shared/components/festival-icon/festival-icon.component';
import { FestiveEffectsComponent } from '@shared/components/festive-effects/festive-effects.component';
import { PromoStyle } from '@shared/components/layout/promo-badge/promo-style';
import { CARD_DIYA, CARD_PROMO_SPARKS } from '@shared/constants/promo.constants';
import { FestivalLookDirective } from '@shared/directives/festival-look.directive';

/** Card-style promo badge (presentational). Owned by `PromoBadgeComponent`. */
@Component({
  selector: 'app-promo-card',
  imports: [FestivalIconComponent, FestivalLookDirective, FestiveEffectsComponent, RouterLink],
  templateUrl: './promo-card.component.html',
  styleUrl: './promo-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoCardComponent extends PromoStyle {
  protected readonly diya = CARD_DIYA;
  protected readonly sparks = CARD_PROMO_SPARKS;
}
