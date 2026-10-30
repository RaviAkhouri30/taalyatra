import { ANCHOR_SECTIONS, ROUTE_PAGES } from '@shared/constants/visibility.constants';
import { LinkKind } from '@shared/enums/link-kind.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { type SiteLink } from '@shared/interfaces/i-site-link';
import { type SiteVisibility } from '@shared/models/site-visibility.model';

/**
 * @param link A link anywhere on the site.
 * @param visibility The owner's switches.
 * @returns Whether the link's target is shown: external links always are; internal ones not when
 *   their page or the home section they point at is switched off.
 */
export function isLinkVisible(link: SiteLink, visibility: SiteVisibility): boolean {
  if (link.kind === LinkKind.External) {
    return true;
  }
  const page = ROUTE_PAGES.get(link.route);
  if (page !== undefined && !visibility.isPageVisible(page)) {
    return false;
  }
  const section = link.fragment === undefined ? undefined : ANCHOR_SECTIONS.get(link.fragment);
  return section === undefined || visibility.isSectionVisible(section);
}

/**
 * @param link A link to show only while its target is on.
 * @param visibility The owner's switches.
 * @returns The link, or `null` when its page or section is switched off.
 */
export function visibleLink<T extends SiteLink>(link: T, visibility: SiteVisibility): T | null {
  return isLinkVisible(link, visibility) ? link : null;
}

/**
 * Drops menu and footer links to switched-off pages and sections (and to the offer section when
 * no promotion runs), empty footer columns, and the floating WhatsApp button when switched off.
 *
 * @param chrome The page layout's chrome.
 * @param visibility The owner's switches.
 * @param offerRunning Whether a promotion is running, so the offer section exists.
 * @returns The chrome to render.
 */
export function applyVisibility(
  chrome: ILayoutChrome,
  visibility: SiteVisibility,
  offerRunning = true,
): ILayoutChrome {
  const keep = <T extends SiteLink>(links: readonly T[]): T[] =>
    links.filter(
      (link) =>
        isLinkVisible(link, visibility) && (offerRunning || !isLinkTo(link, PageAnchor.Diwali)),
    );
  return {
    ...chrome,
    mainNav: keep(chrome.mainNav),
    mobileNav: keep(chrome.mobileNav),
    footerColumns: chrome.footerColumns
      .map((column) => ({ ...column, links: keep(column.links) }))
      .filter((column) => column.links.length > 0),
    showWhatsAppFab: chrome.showWhatsAppFab && visibility.isWidgetVisible(SiteWidget.WhatsApp),
  };
}

function isLinkTo(link: SiteLink, anchor: PageAnchor): boolean {
  return link.kind === LinkKind.Internal && link.fragment === anchor;
}
