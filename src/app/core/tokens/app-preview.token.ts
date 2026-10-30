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
