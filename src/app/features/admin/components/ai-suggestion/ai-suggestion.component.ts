import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';

/**
 * An AI suggestion under its field (0025 V8): the text, its length against the field's limit, and
 * the owner's choice. It takes focus when it appears, so a screen reader reads it.
 */
@Component({
  selector: 'app-ai-suggestion',
  imports: [ButtonDirective],
  templateUrl: './ai-suggestion.component.html',
  styleUrl: './ai-suggestion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', 'aria-label': 'AI suggestion', tabindex: '-1', class: 'as' },
})
export class AiSuggestionComponent {
  /** The suggestion. */
  public readonly text = input.required<string>();
  /** The field's character limit, or `null` for none. */
  public readonly maxLength = input<number | null>(null);
  /** The owner chose to use it. */
  public readonly used = output();
  /** The owner asked for another. */
  public readonly retried = output();
  /** The owner kept their own text. */
  public readonly kept = output();

  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly count = computed(() => {
    const max = this.maxLength();
    return max === null ? '' : `${String(this.text().length)} / ${String(max)} characters`;
  });
  protected readonly over = computed(() => {
    const max = this.maxLength();
    return max !== null && this.text().length > max;
  });

  public constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    // Once drawn: the suggestion is new content the owner should hear about.
    afterNextRender(() => {
      host.nativeElement.focus();
    });
  }
}
