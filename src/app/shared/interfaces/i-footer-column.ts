import { type SiteLink } from './i-site-link';

/** A titled list of links in the footer. */
export interface IFooterColumn {
  readonly heading: string;
  readonly links: readonly SiteLink[];
}
