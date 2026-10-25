import { type ActivatedRouteSnapshot } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';

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
