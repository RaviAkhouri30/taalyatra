import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';

/**
 * Small, safe wrapper around `localStorage` for per-visitor conveniences (e.g. a game's best
 * score). Storage can be missing or blocked (private windows, strict privacy settings), so every
 * call is guarded and failures fall back quietly.
 */
@Service()
export class LocalStoreService {
  private readonly window = inject(DOCUMENT).defaultView;

  /** @returns The stored value, or `null` when absent or unavailable. */
  public get(key: string): string | null {
    try {
      return this.window?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  /** Stores a value; silently does nothing when storage is unavailable. */
  public set(key: string, value: string): void {
    try {
      this.window?.localStorage.setItem(key, value);
    } catch {
      // Storage blocked or full: this data is a convenience, so losing it is acceptable.
    }
  }
}
