import { InjectionToken } from '@angular/core';
import changelog from '@changelog';

/**
 * The CHANGELOG as text, bundled at build time (0016 V1), so What's new can't disagree with the
 * real releases. Only the admin area injects it, so it ships in the admin's lazy chunk alone.
 */
export const CHANGELOG_TEXT = new InjectionToken<string>('CHANGELOG_TEXT', {
  providedIn: 'root',
  factory: () => changelog,
});
