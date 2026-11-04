import { Injectable, inject, signal } from '@angular/core';
import { LocalStoreService } from '@core/services/local-store.service';

/** Where the owner's choice is remembered between visits. */
export const NAV_COLLAPSED_STORAGE_KEY = 'taal-yatra.admin.nav-collapsed';

/** Where the owner's choice about the preview column is remembered. */
export const PREVIEW_HIDDEN_STORAGE_KEY = 'taal-yatra.admin.preview-hidden';

const COLLAPSED = '1';
const EXPANDED = '0';
const HIDDEN = '1';
const SHOWN = '0';

/**
 * The editor's frame: the side panel, collapsed to icons on desktop and a slide-in menu on phones and
 * tablets (separate states, because a phone's menu should start closed whatever the desktop
 * remembers), and whether the preview column shows.
 */
@Injectable()
export class EditorNavService {
  /** Desktop: whether the panel shows icons only. */
  public readonly collapsed = signal(
    inject(LocalStoreService).get(NAV_COLLAPSED_STORAGE_KEY) === COLLAPSED,
  );
  /** Phones and tablets: whether the slide-in menu is open. */
  public readonly drawerOpen = signal(false);

  /** Whether the current page has a preview column, so the top bar's button has a job. */
  public readonly previewAvailable = signal(false);
  /** Desktop: whether the owner has hidden the preview column to give the fields more room. */
  public readonly previewHidden = signal(
    inject(LocalStoreService).get(PREVIEW_HIDDEN_STORAGE_KEY) === HIDDEN,
  );

  private readonly localStore = inject(LocalStoreService);

  public toggleCollapsed(): void {
    const collapsed = !this.collapsed();
    this.collapsed.set(collapsed);
    this.localStore.set(NAV_COLLAPSED_STORAGE_KEY, collapsed ? COLLAPSED : EXPANDED);
  }

  public togglePreview(): void {
    const hidden = !this.previewHidden();
    this.previewHidden.set(hidden);
    this.localStore.set(PREVIEW_HIDDEN_STORAGE_KEY, hidden ? HIDDEN : SHOWN);
  }

  public toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  public closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
