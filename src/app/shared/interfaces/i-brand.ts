/** Brand identity rendered by `BrandComponent` and the footer. */
export interface IBrand {
  readonly name: string;
  readonly tagline: string;
  readonly logoUrl: string;
  readonly logoAlt: string;
  /** One-line description used in the footer. */
  readonly description: string;
  readonly domain: string;
}
