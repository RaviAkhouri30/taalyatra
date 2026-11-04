import { Injectable, inject, signal } from '@angular/core';
import { LocalStoreService } from '@core/services/local-store.service';

/** Where the owner's choice is remembered between visits. */
export const NAV_COLLAPSED_STORAGE_KEY = 'taal-yatra.admin.nav-collapsed';

const COLLAPSED = '1';
const EXPANDED = '0';

/**
 * The editor's side panel: collapsed to icons on desktop, and a slide-in menu on phones and tablets.
 * Two separate states, because a phone's menu should start closed whatever the desktop remembers.
 */
@Injectable()
export class EditorNavService {
  /** Desktop: whether the panel shows icons only. */
  public readonly collapsed = signal(
    inject(LocalStoreService).get(NAV_COLLAPSED_STORAGE_KEY) === COLLAPSED,
  );
  /** Phones and tablets: whether the slide-in menu is open. */
  public readonly drawerOpen = signal(false);

  private readonly localStore = inject(LocalStoreService);

  public toggleCollapsed(): void {
    const collapsed = !this.collapsed();
    this.collapsed.set(collapsed);
    this.localStore.set(NAV_COLLAPSED_STORAGE_KEY, collapsed ? COLLAPSED : EXPANDED);
  }

  public toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  public closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
