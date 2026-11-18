import { Service, inject } from '@angular/core';
import { DeviceStoreService } from './device-store.service';
import { CHANGELOG_TEXT } from '@core/tokens/changelog.token';
import { type IRelease, parseChangelog } from '../models/release-notes';

/** Where this browser remembers the newest release the owner has opened What's new for. */
export const RELEASE_SEEN_KEY = 'taal-yatra.admin.release-seen';

/**
 * The site's releases, read from the bundled CHANGELOG (0016 V1), and which one the owner last
 * saw. "Seen" is kept per browser: a new device shows the New marker once, which is harmless.
 */
@Service()
export class ReleaseNotesService {
  private readonly deviceStore = inject(DeviceStoreService);
  // Parsed once: the text is fixed for the life of the build.
  private readonly all = parseChangelog(inject(CHANGELOG_TEXT));

  /** @returns Every release, newest first. */
  public releases(): readonly IRelease[] {
    return this.all;
  }

  /** @returns The release this build is, or `undefined` when the CHANGELOG has none. */
  public current(): IRelease | undefined {
    return this.all[0];
  }

  /** @returns Whether there's a release the owner hasn't opened What's new for. */
  public hasUnseen(): boolean {
    const current = this.current();
    return current !== undefined && this.deviceStore.get(RELEASE_SEEN_KEY) !== current.version;
  }

  /** Remembers that the owner has seen the current release's notes. */
  public markSeen(): void {
    const current = this.current();
    if (current) {
      this.deviceStore.set(RELEASE_SEEN_KEY, current.version);
    }
  }
}
