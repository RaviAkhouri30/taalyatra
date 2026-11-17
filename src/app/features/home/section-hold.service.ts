import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Observable, takeUntil, timer } from 'rxjs';
import { SCROLL_TAKE_OVER_EVENTS, SECTION_HOLD_MS } from '@shared/constants/reveal.constants';

/**
 * Keeps a linked home section (`/#contact`) where the visitor was sent while the sections above
 * it arrive (0013). The page jumps there as soon as the section exists, but the sections above
 * are still empty then; as each one fills in it pushes the target down, and without this the
 * visitor lands thousands of pixels short.
 *
 * Lives with the home page, not in `AnchorScrollService`, to keep it out of the initial download.
 */
@Service()
export class SectionHoldService {
  private readonly document = inject(DOCUMENT);
  private readonly scroller = inject(ViewportScroller);

  /**
   * @param id The section's element id.
   * @returns A stream that holds the section at the top whenever the page's height changes, and
   *   completes once the page has settled or the visitor scrolls. It never emits.
   */
  public hold(id: string): Observable<never> {
    return new Observable<never>((subscriber) => {
      const view = this.document.defaultView;
      if (view === null || typeof ResizeObserver === 'undefined') {
        subscriber.complete();
        return undefined;
      }
      // Fires once on observe, then on every change: the first call also covers a section that
      // rendered before this started.
      const observer = new ResizeObserver(() => {
        if (this.document.getElementById(id)) {
          this.scroller.scrollToAnchor(id);
        }
      });
      const release = (): void => {
        subscriber.complete();
      };
      observer.observe(this.document.body);
      SCROLL_TAKE_OVER_EVENTS.forEach((type) => {
        view.addEventListener(type, release, { passive: true });
      });
      return () => {
        observer.disconnect();
        SCROLL_TAKE_OVER_EVENTS.forEach((type) => {
          view.removeEventListener(type, release);
        });
      };
    }).pipe(takeUntil(timer(SECTION_HOLD_MS)));
  }
}
