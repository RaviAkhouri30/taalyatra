import { type Observable } from 'rxjs';

/**
 * The browser's offer to install the admin as an app (0026 V10). Chrome on Android makes one once
 * the manifest is in place; Safari on iPhone never does (Add to Home Screen is in its Share menu).
 */
export abstract class IInstallPrompt {
  /** @returns Whether an offer is kept, now and whenever that changes, until unsubscribed. */
  public abstract offers(): Observable<boolean>;

  /** @returns Shows the kept offer once; emits whether it was accepted, `false` with none kept. */
  public abstract install(): Observable<boolean>;

  /** @returns Whether this page is already running as the installed app. */
  public abstract isInstalledApp(): boolean;
}
