import { InjectionToken } from '@angular/core';
import { send } from '@emailjs/browser';

/**
 * The SDK's send function. A token, so the adapter's spec can replace it through DI (CLAUDE.md §9):
 * patching the module fails whenever an earlier spec has already loaded the real one.
 */
export const EMAILJS_SENDER = new InjectionToken<typeof send>('EMAILJS_SENDER', {
  providedIn: 'root',
  factory: () => send,
});
