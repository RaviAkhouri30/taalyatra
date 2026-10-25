import { type AppRoute } from '@shared/enums/app-route.enum';
import { LinkKind } from '@shared/enums/link-kind.enum';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';

/** Optional parts of an internal link. */
type NavLinkOptions = Partial<Pick<INavLink, 'fragment' | 'icon' | 'emphasis'>>;

/** Optional parts of an external link. */
type ExternalLinkOptions = Partial<Pick<IExternalLink, 'ariaLabel' | 'icon'>>;

/**
 * Builds an internal router link.
 * @param label Visible link text.
 * @param route Target route.
 * @param options Fragment, icon or emphasis.
 * @returns An immutable `INavLink`.
 */
export function navLink(label: string, route: AppRoute, options: NavLinkOptions = {}): INavLink {
  return { kind: LinkKind.Internal, label, route, ...options };
}

/**
 * Builds a link to an external URL.
 * @param label Visible link text.
 * @param href Absolute URL or `tel:`/`mailto:` URI.
 * @param options Accessible name or icon.
 * @returns An immutable `IExternalLink`.
 */
export function externalLink(
  label: string,
  href: string,
  options: ExternalLinkOptions = {},
): IExternalLink {
  return { kind: LinkKind.External, label, href, ...options };
}
