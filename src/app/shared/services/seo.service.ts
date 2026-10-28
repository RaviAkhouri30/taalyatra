import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { type IPageMeta } from '@shared/interfaces/i-page-meta';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { toLocalBusiness } from '@shared/utils/local-business.util';

/** Id of the structured-data block, so it is replaced, never duplicated. */
const STRUCTURED_DATA_ID = 'taal-yatra-business';

/**
 * Keeps the page's search and preview metadata in step with the route (0007, D5–D6): description,
 * canonical URL, Open Graph and Twitter tags, and `LocalBusiness` structured data. Called from
 * `SiteShellViewModel` on every navigation; holds no state of its own.
 */
@Service()
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(APP_ENVIRONMENT).siteUrl;

  /**
   * @param page The current page's path, title and description.
   * @param site Site configuration (fallback description, business details).
   */
  public describe(page: IPageMeta, site: ISiteConfig): void {
    const url = `${this.siteUrl}${page.path}`;
    const title = page.title || site.brand.name;
    const description = page.description || site.brand.description;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.link('canonical').setAttribute('href', url);
    this.structuredData().textContent = JSON.stringify(toLocalBusiness(site, this.siteUrl));
  }

  /** @returns The `<link rel>` in the head, created when missing. */
  private link(rel: string): HTMLLinkElement {
    const existing = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (existing) {
      return existing;
    }
    const link = this.document.createElement('link');
    link.rel = rel;
    this.document.head.append(link);
    return link;
  }

  /** @returns The JSON-LD block. A data block, which CSP doesn't treat as a script. */
  private structuredData(): HTMLScriptElement {
    const existing = this.document.getElementById(STRUCTURED_DATA_ID);
    if (existing instanceof HTMLScriptElement) {
      return existing;
    }
    const script = this.document.createElement('script');
    script.id = STRUCTURED_DATA_ID;
    script.type = 'application/ld+json';
    this.document.head.append(script);
    return script;
  }
}
