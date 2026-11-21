import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { type AiStyle } from '@core/enums/ai-style.enum';
import { mediaImageUrl } from '@core/config/media-image-url';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type IAiStatus } from '@core/interfaces/i-ai-service';
import {
  AI_PICTURE_WIDTH,
  AI_STYLE_CHOICES,
  AiAssistMode,
  type IAiFieldInfo,
  aiPictureRequest,
  aiTextRequest,
} from '../../models/ai-assist';
import { parseImageSrc } from '../../models/image-src';
import { AiAssistViewModel } from '../../view-models/ai-assist.view-model';
import { AiSuggestionComponent } from '../ai-suggestion/ai-suggestion.component';

/**
 * AI help for one field (0025 V8): rewrite or suggest under a text field, or suggest a picture's
 * description. Shown only when the help is set up (design); the field changes only when the owner
 * uses a suggestion, through `used`.
 */
@Component({
  selector: 'app-ai-assist',
  imports: [AiSuggestionComponent, ButtonDirective],
  templateUrl: './ai-assist.component.html',
  styleUrl: './ai-assist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AiAssistViewModel],
})
export class AiAssistComponent extends BaseComponent<IAiStatus> {
  /** Under a text field, or beside a picture's description. */
  public readonly mode = input(AiAssistMode.Text);
  /** The field's id, so focus can go back to it after a choice. */
  public readonly fieldId = input.required<string>();
  public readonly label = input.required<string>();
  public readonly hint = input('');
  /** The field's character limit, or `null` for none. */
  public readonly maxLength = input<number | null>(null);
  /** Reads the field's text when the owner asks, so it's never stale. */
  public readonly text = input.required<() => string>();
  /** Reads the same card's other prose when the owner asks (D3). */
  public readonly context = input<() => string>(() => '');
  /** The picture's stored address, for a description. */
  public readonly imageSrc = input('');
  /** The owner used a suggestion: the field takes this text. */
  public readonly used = output<string>();

  protected override readonly model = inject(AiAssistViewModel);
  protected readonly modes = AiAssistMode;
  protected readonly styles = AI_STYLE_CHOICES;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly menuOpen = signal(false);
  /** The field was empty when the menu opened: it offers a first version instead of styles. */
  protected readonly empty = signal(false);
  protected readonly menuId = computed(() => `${this.fieldId()}-ai`);
  protected readonly buttonId = computed(() => `${this.fieldId()}-ai-button`);
  protected readonly forId = computed(() => `${this.fieldId()}-ai-for`);
  /** Text help, or a description of an uploaded picture, once the help is set up. */
  protected readonly shown = computed(() => {
    const status = this.model.data();
    return this.mode() === AiAssistMode.Text
      ? status?.text === true
      : status?.vision === true && parseImageSrc(this.imageSrc()) !== null;
  });

  private readonly document = inject(DOCUMENT);
  private readonly cloudName = inject(CLOUDINARY_CONFIG).cloudName;

  protected toggleMenu(): void {
    if (!this.menuOpen()) {
      this.empty.set(this.text()().trim() === '');
    }
    this.menuOpen.update((open) => !open);
  }

  /** @param style The chosen style; none asks for a first version. */
  protected write(style?: AiStyle): void {
    this.menuOpen.set(false);
    this.model.ask(aiTextRequest(this.info(), this.text()(), style));
  }

  protected describe(): void {
    const url = mediaImageUrl({ src: this.imageSrc(), width: AI_PICTURE_WIDTH }, this.cloudName);
    this.model.ask(aiPictureRequest(this.info(), url));
  }

  /** @param text The suggestion the owner chose. */
  protected use(text: string): void {
    this.used.emit(text);
    this.closeSuggestion();
  }

  protected closeSuggestion(): void {
    this.model.dismiss();
    // The suggestion that had focus is gone: give it back to the field.
    this.document.getElementById(this.fieldId())?.focus();
  }

  private info(): IAiFieldInfo {
    return {
      label: this.label(),
      hint: this.hint(),
      page: this.model.page,
      maxLength: this.maxLength(),
      context: this.context()(),
    };
  }
}
