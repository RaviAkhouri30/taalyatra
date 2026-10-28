/** What search engines and link previews should know about the current page. */
export interface IPageMeta {
  /** Path without query or fragment, e.g. `/videos`. */
  readonly path: string;
  /** The route's title; empty when it has none. */
  readonly title: string;
  /** The route's description; empty when it has none. */
  readonly description: string;
}
