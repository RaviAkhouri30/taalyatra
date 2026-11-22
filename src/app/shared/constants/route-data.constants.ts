/** Keys of custom data set on routes. */
export const ROUTE_DATA_KEYS = {
  /** Holds a `PageLayout` choosing the site chrome. */
  Layout: 'layout',
  /**
   * Holds a public page's `SeoPage` (0028): its default title and description are that page's
   * `PAGE_META`, and the owner's stored ones replace them.
   */
  Seo: 'seo',
} as const;
