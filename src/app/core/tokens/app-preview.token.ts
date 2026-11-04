import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

/** The query parameter that opens the site with the owner's unpublished changes (ADR-0013). */
export const PREVIEW_QUERY_PARAM = 'preview';

/**
 * Whether this visit is a preview of unpublished changes (`/?preview=1`), read once at startup:
 * the data backend is chosen then, and the mode lasts for the whole visit.
 */
export const APP_PREVIEW = new InjectionToken<boolean>('APP_PREVIEW', {
  providedIn: 'root',
  factory: () =>
    new URLSearchParams(inject(DOCUMENT).defaultView?.location.search ?? '').has(
      PREVIEW_QUERY_PARAM,
    ),
});

/**
 * Whether this preview is inside the editor's frame. The site's floating buttons and offer badge are
 * for visitors, and there they'd cover the content being checked. The full preview in its own tab keeps them, as it
 * shows the site as visitors will see it.
 */
export const APP_PREVIEW_FRAME = new InjectionToken<boolean>('APP_PREVIEW_FRAME', {
  providedIn: 'root',
  factory: () => {
    const view = inject(DOCUMENT).defaultView;
    return inject(APP_PREVIEW) && view !== null && view.top !== view;
  },
});
