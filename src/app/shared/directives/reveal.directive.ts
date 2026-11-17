import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { APP_PREVIEW_FRAME } from '@core/tokens/app-preview.token';
import {
  REDUCED_MOTION_QUERY,
  REVEAL_DURATION_MS,
  REVEAL_EASING,
  REVEAL_RISE_PX,
  REVEAL_ROOT_MARGIN,
} from '@shared/constants/reveal.constants';

/**
 * Fades a section in, rising slightly, the first time it scrolls into view (0013). Sections
 * already on screen when the page opens are left alone, so the first screen never waits.
 *
 * Uses the Web Animations API, so there's no stylesheet or inline style to ship, and a transform
 * and opacity only: no layout change, so links to a section land exactly and nothing shifts.
 * Nothing is hidden when the visitor asks for less motion, when the browser can't tell what's in
 * view, or inside the editor's preview, which moves to sections itself.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly inEditor = inject(APP_PREVIEW_FRAME);

  /** Stops whichever observer is running. */
  private stop: (() => void) | null = null;

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.stop?.();
    });
    afterNextRender(() => {
      if (this.motionWanted()) {
        this.whenFilled();
      }
    });
  }

  /**
   * Decides once the section has content. It's created before its data arrives, when it's empty
   * and sits near the top of the page, so where it is then says nothing about where it will be.
   */
  private whenFilled(): void {
    if (this.element.offsetHeight > 0) {
      this.hideIfBelow();
      return;
    }
    const observer = new ResizeObserver(() => {
      if (this.element.offsetHeight > 0) {
        observer.disconnect();
        // Runs after layout and before paint: a section below the screen is never seen unhidden.
        this.hideIfBelow();
      }
    });
    observer.observe(this.element);
    this.stop = () => {
      observer.disconnect();
    };
  }

  /** Hides the section, if it's below the screen, until it scrolls into view. */
  private hideIfBelow(): void {
    if (this.element.getBoundingClientRect().top < (this.view?.innerHeight ?? 0)) {
      this.stop = null;
      return;
    }
    // Hidden by opacity alone, so the section keeps its true position: a link to it lands exactly.
    const hidden = this.element.animate([{ opacity: 0 }], { duration: 0, fill: 'forwards' });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          this.reveal(hidden);
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    );
    observer.observe(this.element);
    this.stop = () => {
      observer.disconnect();
    };
  }

  /** Fades in and rises into place; nothing is left on the element afterwards. */
  private reveal(hidden: Animation): void {
    this.element.animate(
      [
        { opacity: 0, transform: `translateY(${String(REVEAL_RISE_PX)}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: REVEAL_DURATION_MS, easing: REVEAL_EASING },
    );
    // Cancelled after the reveal has started, so there's no frame where the section flashes in.
    hidden.cancel();
  }

  /** @returns Whether to animate at all: the browser can, the visitor wants motion, not the editor. */
  private motionWanted(): boolean {
    return (
      typeof IntersectionObserver !== 'undefined' &&
      typeof ResizeObserver !== 'undefined' &&
      !this.inEditor &&
      this.view !== null &&
      !this.view.matchMedia(REDUCED_MOTION_QUERY).matches
    );
  }
}
