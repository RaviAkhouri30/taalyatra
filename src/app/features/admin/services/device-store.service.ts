import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { LocalStoreService } from '@core/services/local-store.service';

/**
 * This browser's storage, as the editor needs it (0016): knowing whether a value fitted, and
 * removing one. Kept in the admin area, not in `LocalStoreService`, which ships with the public
 * site's first download.
 */
@Service()
export class DeviceStoreService {
  private readonly local = inject(LocalStoreService);
  private readonly window = inject(DOCUMENT).defaultView;

  /** @returns The stored value, or `null` when absent or unavailable. */
  public get(key: string): string | null {
    return this.local.get(key);
  }

  /**
   * Stores a value.
   * @returns Whether it was stored: storage fails quietly when it's full or blocked, so the value
   *   is read back.
   */
  public set(key: string, value: string): boolean {
    this.local.set(key, value);
    return this.local.get(key) === value;
  }

  /** Removes a value; does nothing when storage is unavailable. */
  public remove(key: string): void {
    try {
      this.window?.localStorage.removeItem(key);
    } catch {
      // Storage blocked: there is nothing stored to remove.
    }
  }
}
