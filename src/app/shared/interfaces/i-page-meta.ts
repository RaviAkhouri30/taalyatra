import { type SeoPage } from '@shared/enums/seo-page.enum';

/** What search engines and link previews should know about the current page. */
export interface IPageMeta {
  /** Path without query or fragment, e.g. `/videos`. */
  readonly path: string;
  /** The route's title; empty when it has none. */
  readonly title: string;
  /** The route's description; empty when it has none. */
  readonly description: string;
  /**
   * A public page (0028): its title and description are the owner's stored ones, else its
   * `PAGE_META`, in place of the two above.
   */
  readonly page?: SeoPage;
}
