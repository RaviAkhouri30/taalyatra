import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type DiyaPalette } from '@shared/constants/promo.constants';

/** Filled diya (oil lamp) illustration used by the Diwali promo badges. Decorative. */
@Component({
  selector: 'app-diya-icon',
  templateUrl: './diya-icon.component.html',
  styleUrl: './diya-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiyaIconComponent {
  public readonly palette = input.required<DiyaPalette>();
}
