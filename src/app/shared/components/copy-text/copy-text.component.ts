import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { CopyTextViewModel } from './copy-text.view-model';
import { type ICopyRequest } from './i-copy-request';

/** Gives each instance's tooltip its own id. */
let tooltipCount = 0;

/** @returns A tooltip id not used by any other instance. */
function createTooltipId(): string {
  tooltipCount += 1;
  return `copy-text-tip-${String(tooltipCount)}`;
}

/**
 * A long text shown on one line with an ellipsis. Hovering or focusing it shows the full text in
 * a tooltip (Escape closes it); clicking copies it and confirms with a toast.
 */
@Component({
  selector: 'app-copy-text',
  imports: [IconComponent],
  templateUrl: './copy-text.component.html',
  styleUrl: './copy-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CopyTextViewModel],
  host: {
    // On the host, so the pointer can move onto the tooltip without closing it (WCAG 1.4.13).
    '(mouseenter)': 'model.showTooltip()',
    '(mouseleave)': 'model.hideTooltip()',
    '(keydown.escape)': 'model.hideTooltip()',
  },
})
export class CopyTextComponent extends BaseComponent<never> {
  /** The full text to show and copy. */
  public readonly text = input.required<string>();
  /** The action, e.g. "Copy address"; starts the button's accessible name. */
  public readonly action = input.required<string>();
  /** Toast after a successful copy. */
  public readonly copied = input.required<string>();
  /** Toast when copying fails. */
  public readonly failed = input.required<string>();

  protected override readonly model = inject(CopyTextViewModel);
  protected readonly copyIcon = IconName.Copy;
  protected readonly tooltipId = createTooltipId();
  /** Names the action and includes the visible text (WCAG 2.5.3, label in name). */
  protected readonly accessibleName = computed(() => `${this.action()}: ${this.text()}`);
  protected readonly request = computed<ICopyRequest>(() => ({
    text: this.text(),
    copied: this.copied(),
    failed: this.failed(),
  }));
}
