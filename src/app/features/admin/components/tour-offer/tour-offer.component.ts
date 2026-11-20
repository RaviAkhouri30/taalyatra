import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { TourService } from '../../services/tour.service';

/** Offers the guided tour once per account on each device (0020 decision D2). */
@Component({
  selector: 'app-tour-offer',
  imports: [ButtonDirective],
  templateUrl: './tour-offer.component.html',
  styleUrl: './tour-offer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourOfferComponent {
  protected readonly tour = inject(TourService);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
}
