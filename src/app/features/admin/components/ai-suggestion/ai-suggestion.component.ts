import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { RevealDelayDirective } from '../../directives/reveal-delay.directive';
import { aiWords } from '../../models/ai-choices';
import { AiSparkComponent } from '../ai-spark/ai-spark.component';

/**
 * An AI suggestion under its field (0025 V8, 0029): a shimmer while it's written, then the text
 * arriving word by word, its length against the field's limit, the owner's own text beside it, and
 * the owner's choice. **Use this** takes focus when it arrives.
 */
@Component({
  selector: 'app-ai-suggestion',
  imports: [AiSparkComponent, ButtonDirective, IconComponent, RevealDelayDirective],
  templateUrl: './ai-suggestion.component.html',
  styleUrl: './ai-suggestion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', 'aria-label': 'AI suggestion', class: 'as' },
})
export class AiSuggestionComponent {
  /** The suggestion; `null` while it's being written. */
  public readonly text = input.required<string | null>();
  /** What was asked for, e.g. "Shorter". */
  public readonly label = input.required<string>();
  /** The owner's own text, shortened; empty when the field was. */
  public readonly yours = input('');
  /** The field's character limit, or `null` for none. */
  public readonly maxLength = input<number | null>(null);
  /** The owner chose to use it. */
  public readonly used = output();
  /** The owner asked for another. */
  public readonly retried = output();
  /** The owner kept their own text. */
  public readonly discarded = output();

  protected readonly icons = IconName;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly words = computed(() => aiWords(this.text() ?? ''));
  protected readonly count = computed(() => {
    const max = this.maxLength();
    return max === null ? '' : `${String(this.text()?.length ?? 0)} / ${String(max)}`;
  });
  protected readonly over = computed(() => {
    const max = this.maxLength();
    return max !== null && (this.text()?.length ?? 0) > max;
  });

  private readonly useButton = viewChild<ElementRef<HTMLButtonElement>>('use');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  public constructor() {
    afterRenderEffect(() => {
      const arrived = this.text() !== null;
      // Into view above the editor's sticky publish bar (its scroll margin), as it opens and
      // again when the words arrive; then the owner's next step is to take it or not.
      this.host.nativeElement.scrollIntoView({ block: 'nearest' });
      if (arrived) {
        this.useButton()?.nativeElement.focus({ preventScroll: true });
      }
    });
  }
}
