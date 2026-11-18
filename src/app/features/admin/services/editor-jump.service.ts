import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Elements that take the cursor when the owner jumps to them. */
const FOCUSABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Takes the owner to a card or a field in the editor (0017 U2), from Find or a click in the
 * preview: on this tab it scrolls there; on another, it opens that tab, which scrolls on arrival.
 */
@Service()
export class EditorJumpService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  /**
   * @param url The tab's address, e.g. `/admin/hero`.
   * @param fragment The field's or card's element id.
   * @param fallback Where to go when that element isn't on the page (a field hidden by a switch).
   */
  public jump(url: string, fragment: string, fallback = fragment): void {
    if (this.router.url.split('#')[0] !== url) {
      void this.router.navigate([url], { fragment });
      return;
    }
    this.reveal(fragment, fallback);
  }

  /**
   * Scrolls to an element on this page, and puts the cursor in it when it's a field.
   * @param fragment The element id.
   * @param fallback The id to use when that element isn't on the page.
   */
  public reveal(fragment: string, fallback = fragment): void {
    const target = this.document.getElementById(fragment) ?? this.document.getElementById(fallback);
    target?.scrollIntoView({ block: 'center' });
    if (target && FOCUSABLE.has(target.tagName)) {
      target.focus({ preventScroll: true });
    }
  }
}
