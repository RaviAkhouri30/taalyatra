import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { DiyaIconComponent } from '@shared/components/diya-icon/diya-icon.component';
import { FestiveEffectsComponent } from '@shared/components/festive-effects/festive-effects.component';
import { CARD_DIYA } from '@shared/constants/promo.constants';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeOfferViewModel } from './home-offer.view-model';
import { type OfferModel } from './offer.model';

/**
 * Seasonal offer band (design `#diwali`): festive background and particles, three package
 * cards and two calls to action. Renders nothing when no offer is running.
 */
@Component({
  selector: 'app-home-offer',
  imports: [
    ButtonDirective,
    DiyaIconComponent,
    FestiveEffectsComponent,
    NgOptimizedImage,
    RouterLink,
  ],
  templateUrl: './home-offer.component.html',
  styleUrl: './home-offer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeOfferViewModel],
})
export class HomeOfferComponent extends BaseComponent<OfferModel> {
  protected override readonly model = inject(HomeOfferViewModel);
  protected readonly anchor = PageAnchor.Diwali;
  protected readonly buttonVariant = ButtonVariant;
  protected readonly diya = CARD_DIYA;
}
