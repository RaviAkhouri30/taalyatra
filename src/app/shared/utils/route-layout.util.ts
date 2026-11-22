import { type ActivatedRouteSnapshot } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { PAGE_META } from '@shared/constants/page-meta.constants';
import { type SeoPage } from '@shared/enums/seo-page.enum';
import { type IPageMeta } from '@shared/interfaces/i-page-meta';

/** Layout used when no route in the active branch declares one. */
export const DEFAULT_PAGE_LAYOUT = PageLayout.Page;

/**
 * Type guard for values read from untyped route data.
 * @param value Candidate value.
 * @returns Whether `value` is a `PageLayout`.
 */
export function isPageLayout(value: unknown): value is PageLayout {
  return Object.values<unknown>(PageLayout).includes(value);
}

/**
 * @param value Candidate value from untyped route data.
 * @returns Whether `value` is a `SeoPage`.
 */
function isSeoPage(value: unknown): value is SeoPage {
  return typeof value === 'string' && Object.hasOwn(PAGE_META, value);
}

/**
 * Walks the active route branch and returns the deepest declared layout, so child routes can
 * override their parent.
 * @param root Root snapshot of the router state.
 * @returns The layout to render.
 */
export function resolvePageLayout(root: ActivatedRouteSnapshot): PageLayout {
  let layout = DEFAULT_PAGE_LAYOUT;
  for (let node: ActivatedRouteSnapshot | null = root; node; node = node.firstChild) {
    const declared: unknown = node.data[ROUTE_DATA_KEYS.Layout];
    if (isPageLayout(declared)) {
      layout = declared;
    }
  }
  return layout;
}

/**
 * Reads the active route branch for search and preview metadata: the deepest title wins, like the
 * layout. A public page names its `SeoPage` instead, whose title and description `SeoService`
 * takes from the owner's stored text or `PAGE_META`.
 * @param root Root snapshot of the router state.
 * @param url The router's current URL.
 * @returns The page's path, title and description, and the page whose stored text replaces them.
 */
export function resolvePageMeta(root: ActivatedRouteSnapshot, url: string): IPageMeta {
  let title = '';
  let page: SeoPage | undefined;
  for (let node: ActivatedRouteSnapshot | null = root; node; node = node.firstChild) {
    const named: unknown = node.data[ROUTE_DATA_KEYS.Seo];
    title = node.title ?? title;
    page = isSeoPage(named) ? named : page;
  }
  const path = url.split(/[?#]/)[0] ?? '/';
  return page === undefined
    ? { path, title, description: '' }
    : { path, title, description: '', page };
}
