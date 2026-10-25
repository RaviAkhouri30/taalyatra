import { type AppRoute } from '@shared/enums/app-route.enum';
import { type IconName } from '@shared/enums/icon-name.enum';
import { type LinkKind } from '@shared/enums/link-kind.enum';
import { type NavEmphasis } from '@shared/enums/nav-emphasis.enum';
import { type PageAnchor } from '@shared/enums/page-anchor.enum';

/** A link to a route inside the site, optionally to a section on that page. */
export interface INavLink {
  readonly kind: LinkKind.Internal;
  readonly label: string;
  readonly route: AppRoute;
  readonly fragment?: PageAnchor;
  readonly icon?: IconName;
  readonly emphasis?: NavEmphasis;
}

/** A link that leaves the app (tel:, mailto:, maps, social networks). */
export interface IExternalLink {
  readonly kind: LinkKind.External;
  readonly label: string;
  readonly href: string;
  readonly ariaLabel?: string;
  readonly icon?: IconName;
}

/** Any link rendered by shared navigation components; narrow on `kind`. */
export type SiteLink = INavLink | IExternalLink;
