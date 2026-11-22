import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { type Observable, defer, finalize, tap } from 'rxjs';
import { IInstallPrompt } from '@core/interfaces/i-install-prompt';
import {
  ADMIN_APP_ATTRIBUTE,
  ADMIN_APP_META,
  ADMIN_MANIFEST_HREF,
  ADMIN_TOUCH_ICON_HREF,
  VIEWPORT_FIT_COVER,
} from '../models/admin-app.constants';

/**
 * The admin as an installable app (0026 V10): its manifest and iPhone tags while the admin is open,
 * none on the public site (D2), and the browser's install offer. Provided on the admin routes.
 */
@Injectable()
export class AdminAppService {
  /** The browser has an install offer kept for the Install button (Android). */
  public readonly canInstall = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly prompt = inject(IInstallPrompt);
  /** What the site had before the admin changed it, to put back. */
  private touchIcon: string | null = null;
  private viewport: string | null = null;

  /** @returns Whether this page is already the installed app. */
  public isInstalledApp(): boolean {
    return this.prompt.isInstalledApp();
  }

  /**
   * Adds the app's tags and keeps the browser's install offer until unsubscribed, then removes
   * them and puts the site's back.
   * @returns A stream to subscribe for as long as the admin is open.
   */
  public attach(): Observable<unknown> {
    // defer: the tags go in when the admin subscribes, not when the stream is built.
    return defer(() => {
      this.addTags();
      return this.prompt.offers();
    }).pipe(
      tap((available) => {
        this.canInstall.set(available);
      }),
      finalize(() => {
        this.removeTags();
      }),
    );
  }

  /** @returns Shows the browser's install offer; emits whether it was accepted. */
  public install(): Observable<boolean> {
    return this.prompt.install().pipe(
      tap(() => {
        // An offer is shown once, whatever the answer.
        this.canInstall.set(false);
      }),
    );
  }

  private addTags(): void {
    const head = this.document.head;
    const manifest = this.document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = ADMIN_MANIFEST_HREF;
    manifest.setAttribute(ADMIN_APP_ATTRIBUTE, '');
    head.append(manifest);
    const icon = head.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    this.touchIcon = icon?.getAttribute('href') ?? null;
    icon?.setAttribute('href', ADMIN_TOUCH_ICON_HREF);
    ADMIN_APP_META.forEach((tag) => this.meta.updateTag(tag));
    this.viewport = this.meta.getTag('name="viewport"')?.content ?? null;
    if (this.viewport !== null && !this.viewport.includes(VIEWPORT_FIT_COVER)) {
      this.meta.updateTag({ name: 'viewport', content: `${this.viewport}, ${VIEWPORT_FIT_COVER}` });
    }
  }

  private removeTags(): void {
    const head = this.document.head;
    head.querySelectorAll(`[${ADMIN_APP_ATTRIBUTE}]`).forEach((tag) => {
      tag.remove();
    });
    if (this.touchIcon !== null) {
      head.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', this.touchIcon);
    }
    ADMIN_APP_META.forEach((tag) => {
      this.meta.removeTag(`name="${tag.name}"`);
    });
    if (this.viewport !== null) {
      this.meta.updateTag({ name: 'viewport', content: this.viewport });
    }
  }
}
