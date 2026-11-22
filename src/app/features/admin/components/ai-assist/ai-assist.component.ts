import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { mediaImageUrl } from '@core/config/media-image-url';
import { type IAiStatus } from '@core/interfaces/i-ai-service';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';
import { BaseComponent } from '@shared/base/base-component';
import {
  AI_PICTURE_WIDTH,
  AiAssistMode,
  type IAiFieldInfo,
  aiPictureRequest,
  aiTextRequest,
} from '../../models/ai-assist';
import {
  AI_WRITE,
  type IAiChoice,
  aiOffer,
  aiShortcutLabel,
  aiYours,
  isAiShortcut,
} from '../../models/ai-choices';
import { parseImageSrc } from '../../models/image-src';
import { AiAssistViewModel } from '../../view-models/ai-assist.view-model';
import { AiMenuComponent } from '../ai-menu/ai-menu.component';
import { AiSparkComponent } from '../ai-spark/ai-spark.component';
import { AiSuggestionComponent } from '../ai-suggestion/ai-suggestion.component';

/**
 * AI help for one field (0025 V8, 0029). It wraps the field: the field is projected into a frame
 * with a small ✦ chip in its corner, which opens a menu (or Ctrl J / ⌘ J). While the AI writes, a
 * ring turns around the field; the suggestion opens under it. Shown only when the help is set up;
 * otherwise it's just the field. The field changes only through `used`.
 */
@Component({
  selector: 'app-ai-assist',
  imports: [AiMenuComponent, AiSparkComponent, AiSuggestionComponent],
  templateUrl: './ai-assist.component.html',
  styleUrl: './ai-assist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AiAssistViewModel],
  host: {
    class: 'aa',
    '[class.aa--on]': 'shown()',
    '[class.aa--long]': 'long()',
    '(document:pointerdown)': 'onOutside($event)',
    // Keys pressed in the field (or the menu) bubble up to here.
    '(keydown)': 'onKey($event)',
  },
})
export class AiAssistComponent extends BaseComponent<IAiStatus> {
  /** A text field, or a photo's description. */
  public readonly mode = input(AiAssistMode.Text);
  /** A long text box: the chip sits at its foot, not its end. */
  public readonly long = input(false);
  /** Whether the field has text now: an empty one is offered a first version. */
  public readonly filled = input(false);
  /** The field's id, so focus can go back to it. */
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
  /** The field takes this text: a suggestion used, or the owner's own brought back by Undo. */
  public readonly used = output<string>();

  protected override readonly model = inject(AiAssistViewModel);
  protected readonly menuOpen = signal(false);
  /** What was asked for, e.g. "Shorter", for the suggestion's heading. */
  protected readonly asked = signal('');
  /** The owner's text when they asked, shortened, shown beside the suggestion. */
  protected readonly yours = signal('');
  protected readonly offer = computed(() => aiOffer(this.mode(), this.filled()));
  /** Describes the chip and the menu: the field they're for. Not their name, so the field's
   * label stays the field's alone (`getByLabel` and screen readers find one thing). */
  protected readonly forText = computed(() => `For ${this.label()}`);
  protected readonly forId = computed(() => `${this.fieldId()}-ai-for`);
  protected readonly shortcut: string;
  /** Text help, or a description of an uploaded picture, once the help is set up. */
  protected readonly shown = computed(() => {
    const status = this.model.data();
    return this.mode() === AiAssistMode.Text
      ? status?.text === true
      : status?.vision === true && parseImageSrc(this.imageSrc()) !== null;
  });
  /** Said once to a screen reader: the suggestion whole, never word by word. */
  protected readonly announcement = computed(() => {
    const suggestion = this.model.suggestion();
    if (this.model.busy()) {
      return 'Writing…';
    }
    return suggestion === null ? '' : `Suggestion ready: ${suggestion}`;
  });

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cloudName = inject(CLOUDINARY_CONFIG).cloudName;
  private readonly chip = viewChild<ElementRef<HTMLButtonElement>>('chip');

  public constructor() {
    super();
    this.shortcut = aiShortcutLabel(this.document.defaultView?.navigator.userAgent ?? '');
  }

  /** @param event A key pressed in the field or the menu. */
  protected onKey(event: KeyboardEvent): void {
    if (this.shown() && !this.model.busy() && isAiShortcut(event)) {
      // The browser's own use of the shortcut is set aside only inside a field with AI help.
      event.preventDefault();
      this.menuOpen.set(true);
    }
  }

  /** @param event A press anywhere: outside this field, the menu closes. */
  protected onOutside(event: Event): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node | null)) {
      this.menuOpen.set(false);
    }
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.chip()?.nativeElement.focus();
  }

  /** @param choice What the owner asked the AI to do. */
  protected choose(choice: IAiChoice): void {
    this.menuOpen.set(false);
    this.asked.set(choice.label);
    const text = this.text()();
    this.yours.set(aiYours(text));
    if (this.mode() === AiAssistMode.Picture) {
      const url = mediaImageUrl({ src: this.imageSrc(), width: AI_PICTURE_WIDTH }, this.cloudName);
      this.model.ask(aiPictureRequest(this.info(), url));
      return;
    }
    this.model.ask(
      choice.key === AI_WRITE
        ? aiTextRequest(this.info(), text)
        : aiTextRequest(this.info(), text, choice.key),
    );
  }

  /** @param text The suggestion the owner chose. */
  protected use(text: string | null): void {
    if (text === null) {
      return;
    }
    this.model.used(this.text()());
    this.used.emit(text);
    this.focusField();
  }

  /** Brings back the owner's text from before the suggestion. */
  protected undo(): void {
    const before = this.model.undo();
    if (before !== null) {
      this.used.emit(before);
    }
    this.model.dropUndo();
    this.focusField();
  }

  protected discard(): void {
    this.model.dismiss();
    this.focusField();
  }

  private focusField(): void {
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
