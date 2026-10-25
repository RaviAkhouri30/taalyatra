import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICON_REGISTRY } from '@shared/constants/icon-registry.constants';
import { type IconName } from '@shared/enums/icon-name.enum';

/** Default rendered size in px. */
const DEFAULT_ICON_SIZE = 24;
/** Default stroke width on the 24×24 grid. */
const DEFAULT_STROKE_WIDTH = 2;

/**
 * Inline stroke icon from `ICON_REGISTRY`, drawn in `currentColor`.
 * Decorative by default (`aria-hidden`); give the surrounding control an accessible name.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  public readonly name = input.required<IconName>();
  public readonly size = input<number>(DEFAULT_ICON_SIZE);
  public readonly strokeWidth = input<number>(DEFAULT_STROKE_WIDTH);

  protected readonly nodes = computed(() => ICON_REGISTRY[this.name()]);
}
