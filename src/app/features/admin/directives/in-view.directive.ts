import { DestroyRef, Directive, ElementRef, afterNextRender, inject, output } from '@angular/core';
import { READING_BAND } from '../models/editor-nav.constants';

/**
 * Says when its element scrolls into the reading band, so the preview can follow the editor
 * card the owner has scrolled to. The viewport is the observer's root, which also works inside
 * the editor's own scrolling column: an observer clips by every scrolling ancestor.
 */
@Directive({ selector: '[appInView]' })
export class InViewDirective {
  /** Emits each time the element reaches the reading line. */
  public readonly entered = output();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.entered.emit();
          }
        },
        { rootMargin: READING_BAND },
      );
      observer.observe(this.element);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }
}
