import { Directive, computed, input } from '@angular/core';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';

/**
 * Styles a native `<a>` or `<button>` as a design-system button.
 * Styles live in `src/styles/_buttons.scss`, because they decorate elements across components.
 *
 * @example
 * <a appButton [variant]="buttonVariant.Ghost" routerLink="/videos">Watch us play</a>
 */
@Directive({
  selector: 'a[appButton], button[appButton]',
  host: {
    class: 'btn',
    '[class.btn--ghost]': 'isGhost()',
    '[class.btn--dark]': 'isDark()',
    '[class.btn--line]': 'isLine()',
    '[class.btn--compact]': 'isCompact()',
  },
})
export class ButtonDirective {
  /** Visual variant; defaults to the solid accent button. */
  public readonly variant = input<ButtonVariant>(ButtonVariant.Primary);
  /** Size variant; `Compact` is used in the header. */
  public readonly size = input<ButtonSize>(ButtonSize.Regular);

  protected readonly isGhost = computed(() => this.variant() === ButtonVariant.Ghost);
  protected readonly isDark = computed(() => this.variant() === ButtonVariant.Dark);
  protected readonly isLine = computed(() => this.variant() === ButtonVariant.Line);
  protected readonly isCompact = computed(() => this.size() === ButtonSize.Compact);
}
