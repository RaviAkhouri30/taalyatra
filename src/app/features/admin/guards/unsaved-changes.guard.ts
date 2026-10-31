import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type CanDeactivateFn } from '@angular/router';

/** What the owner is asked before leaving with a change still saving or not saved. */
export const LEAVE_WARNING =
  'A change is still saving or couldn’t be saved. Leave this page anyway?';

/** A page that can tell whether leaving now could lose a change. */
export interface IUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Asks before leaving an editor page while a change is pending (0008 D20). Saving is automatic,
 * so this only appears in the second before a save, or after a failed one.
 */
export const unsavedChangesGuard: CanDeactivateFn<IUnsavedChanges> = (page) =>
  !page.hasUnsavedChanges() || (inject(DOCUMENT).defaultView?.confirm(LEAVE_WARNING) ?? true);
