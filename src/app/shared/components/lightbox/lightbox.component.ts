import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { type IImage } from '@shared/interfaces/i-image';
import { type ILightboxLabels } from '@shared/interfaces/i-lightbox-labels';
import { formatTemplate } from '@shared/utils/format-template.util';

/** Keys the viewer responds to while it has focus. */
const KEY_CLOSE = 'Escape';
const KEY_PREVIOUS = 'ArrowLeft';
const KEY_NEXT = 'ArrowRight';

/**
 * Full-screen photo viewer (modal dialog). Focus moves to the close button when it opens;
 * Escape closes it and the arrow keys step through the photos. Navigation state belongs to the
 * owner, which listens to the outputs.
 */
@Component({
  selector: 'app-lightbox',
  imports: [NgOptimizedImage],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKeydown($event)' },
})
export class LightboxComponent {
  public readonly images = input.required<readonly IImage[]>();
  public readonly index = input.required<number>();
  public readonly labels = input.required<ILightboxLabels>();
  public readonly closed = output();
  public readonly previous = output();
  public readonly next = output();

  protected readonly image = computed(() => this.images().at(this.index()));
  protected readonly caption = computed(() =>
    formatTemplate(this.labels().caption, {
      alt: this.image()?.alt ?? '',
      index: this.index() + 1,
      total: this.images().length,
    }),
  );

  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');

  public constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // WebKit drops focus given in the frame this component's stylesheet is first attached;
      // focusing one frame later sticks in every engine.
      const frame = requestAnimationFrame(() => {
        this.closeButton().nativeElement.focus();
      });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
      });
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const actions = new Map([
      [KEY_CLOSE, this.closed],
      [KEY_PREVIOUS, this.previous],
      [KEY_NEXT, this.next],
    ]);
    const action = actions.get(event.key);
    if (action) {
      event.preventDefault();
      action.emit();
    }
  }
}
