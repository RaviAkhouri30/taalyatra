import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FestivalIconComponent } from '@shared/components/festival-icon/festival-icon.component';
import { FestiveEffectsComponent } from '@shared/components/festive-effects/festive-effects.component';
import { PromoStyle } from '@shared/components/layout/promo-badge/promo-style';
import { PILL_DIYA, PILL_PROMO_SPARKS } from '@shared/constants/promo.constants';
import { FestivalLookDirective } from '@shared/directives/festival-look.directive';

/** Pill-style promo badge (presentational). Owned by `PromoBadgeComponent`. */
@Component({
  selector: 'app-promo-pill',
  imports: [FestivalIconComponent, FestivalLookDirective, FestiveEffectsComponent, RouterLink],
  templateUrl: './promo-pill.component.html',
  styleUrl: './promo-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoPillComponent extends PromoStyle {
  protected readonly diya = PILL_DIYA;
  protected readonly sparks = PILL_PROMO_SPARKS;
}
