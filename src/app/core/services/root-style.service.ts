import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { type IRootStyle } from '@core/interfaces/i-root-style';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { LocalStoreService } from './local-store.service';

/** Where this device keeps the theme's background; `index.html` reads the same key. */
export const REMEMBERED_BACKGROUND_KEY = 'taal-yatra.theme.background';

/** The variables this service owns; the stylesheet's defaults live on `:root` (`_theme.scss`). */
const VARIABLE_PREFIX = '--ty-';
/** Marks the stylesheets this service added, so it can replace them. */
const STYLESHEET_MARK = 'data-ty-theme';

/**
 * The only code that changes the page's own style (ADR-0019): CSS variables on `<html>`, its
 * stylesheets, the browser bar's colour. It knows nothing about themes. Setting properties through
 * the CSSOM isn't blocked by the strict CSP, which covers scripts.
 */
@Service()
export class RootStyleService {
  private readonly document = inject(DOCUMENT);
  private readonly store = inject(LocalStoreService);
  // A preview shows a draft: remembering its background would show it to this device's next visit.
  private readonly preview = inject(APP_PREVIEW);

  /** @param style What the page should show; replaces whatever an earlier call (or index.html) set. */
  public apply(style: IRootStyle): void {
    this.setVariables(style.variables);
    this.setStylesheets(style.stylesheets);
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', style.browserColour);
    if (!this.preview) {
      this.remember(style.rememberedBackground);
    }
  }

  private setVariables(variables: ReadonlyMap<string, string>): void {
    const root = this.document.documentElement.style;
    // Cleared by prefix, not by what this service set last: index.html may have set one too.
    const stale = Array.from(root).filter(
      (name) => name.startsWith(VARIABLE_PREFIX) && !variables.has(name),
    );
    for (const name of stale) {
      root.removeProperty(name);
    }
    for (const [name, value] of variables) {
      root.setProperty(name, value);
    }
  }

  private setStylesheets(hrefs: readonly string[]): void {
    const existing = Array.from(this.document.querySelectorAll(`link[${STYLESHEET_MARK}]`));
    for (const link of existing.filter(
      (element) => !hrefs.includes(element.getAttribute('href') ?? ''),
    )) {
      link.remove();
    }
    const loaded = new Set(existing.map((element) => element.getAttribute('href')));
    for (const href of hrefs.filter((wanted) => !loaded.has(wanted))) {
      const link = this.document.createElement('link');
      link.setAttribute(STYLESHEET_MARK, '');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', href);
      this.document.head.appendChild(link);
    }
  }

  private remember(background: string | null): void {
    if (background === null) {
      this.store.remove(REMEMBERED_BACKGROUND_KEY);
    } else {
      this.store.set(REMEMBERED_BACKGROUND_KEY, background);
    }
  }
}
