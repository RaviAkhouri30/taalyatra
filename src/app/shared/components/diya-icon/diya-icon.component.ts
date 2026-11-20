import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type DiyaPalette } from '@shared/constants/promo.constants';

/**
 * Filled diya (oil lamp) illustration used by the Diwali promo badges. Decorative. Its colours are
 * in its styles, so they follow the theme (an SVG `fill` attribute can't read a CSS variable).
 */
@Component({
  selector: 'app-diya-icon',
  templateUrl: './diya-icon.component.html',
  styleUrl: './diya-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'variantClass()' },
})
export class DiyaIconComponent {
  /** The icon's size and colouring. */
  public readonly palette = input.required<DiyaPalette>();
  protected readonly variantClass = computed(() => `diya--${this.palette().variant}`);
}
