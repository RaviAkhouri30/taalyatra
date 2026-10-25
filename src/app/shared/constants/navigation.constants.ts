import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { NavEmphasis } from '@shared/enums/nav-emphasis.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { FooterVariant, PromoVariant } from '@shared/enums/variant.enums';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { navLink } from '@shared/utils/link.util';

// Links shared by several menus — defined once so labels and targets never drift.
const SHOWS = navLink('Shows', AppRoute.Shows);
const VIDEOS = navLink('Videos', AppRoute.Videos);
const TEAM = navLink('Team', AppRoute.Team);
const ACHIEVEMENTS = navLink('Achievements', AppRoute.Achievements);
const PAGE_LINKS = [SHOWS, VIDEOS, TEAM, ACHIEVEMENTS];
/** A link to a section of the home page. */
function homeSection(label: string, fragment: PageAnchor): INavLink {
  return navLink(label, AppRoute.Home, { fragment });
}

const EXPERIENCES = homeSection('Experiences', PageAnchor.Experiences);
const REQUEST_PROPOSAL = homeSection('Request proposal', PageAnchor.Contact);
const MOBILE_SECTIONS = {
  diwali: homeSection('Diwali offers', PageAnchor.Diwali),
  gallery: homeSection('Gallery', PageAnchor.Gallery),
};

/** Home page chrome (design: Main.dc.html). */
const HOME_CHROME: ILayoutChrome = {
  brandLink: homeSection('Taal Yatra Drum Circle, home', PageAnchor.Top),
  mainNav: [
    navLink('Diwali', AppRoute.Home, { fragment: PageAnchor.Diwali, emphasis: NavEmphasis.Hot }),
    EXPERIENCES,
    ...PAGE_LINKS,
    homeSection('Contact', PageAnchor.Contact),
  ],
  mobileNav: [
    MOBILE_SECTIONS.diwali,
    EXPERIENCES,
    ...PAGE_LINKS,
    MOBILE_SECTIONS.gallery,
    REQUEST_PROPOSAL,
  ],
  headerCta: REQUEST_PROPOSAL,
  actionBarCta: homeSection('Get proposal', PageAnchor.Contact),
  footer: FooterVariant.Full,
  footerColumns: [
    {
      heading: 'Experiences',
      links: [
        homeSection('Drum Circle', PageAnchor.DrumCircleDetails),
        ...['Boombastic', 'Body Percussion', 'Harmonica', 'Trash Jam', 'Lezim Workshop'].map(
          (label) => homeSection(label, PageAnchor.Experiences),
        ),
      ],
    },
    {
      heading: 'Explore',
      links: [
        homeSection('Who it’s for', PageAnchor.ForEveryone),
        homeSection('Gallery', PageAnchor.Gallery),
        homeSection('Shows', PageAnchor.Shows),
        navLink('Show formats', AppRoute.Shows),
        ACHIEVEMENTS,
        homeSection('Rhythm game', PageAnchor.Play),
        homeSection('Our story', PageAnchor.Philosophy),
        TEAM,
        VIDEOS,
        homeSection('FAQ', PageAnchor.Faq),
      ],
    },
  ],
  promo: PromoVariant.Pill,
  showWhatsAppFab: false, // the home page has its own chat/call/WhatsApp cluster
};

/** Inner page chrome (design: Shows/Team/Videos/Achievements.dc.html). */
const PAGE_CHROME: ILayoutChrome = {
  brandLink: navLink('Taal Yatra Drum Circle, home', AppRoute.Home),
  mainNav: [
    navLink('Home', AppRoute.Home, { icon: IconName.Home, emphasis: NavEmphasis.Home }),
    EXPERIENCES,
    ...PAGE_LINKS,
    homeSection('Contact', PageAnchor.Contact),
  ],
  mobileNav: [
    navLink('← Back to home', AppRoute.Home),
    MOBILE_SECTIONS.diwali,
    EXPERIENCES,
    ...PAGE_LINKS,
    MOBILE_SECTIONS.gallery,
    REQUEST_PROPOSAL,
  ],
  headerCta: navLink('Plan your session', AppRoute.Home),
  actionBarCta: navLink('Get proposal', AppRoute.Home),
  footer: FooterVariant.Compact,
  footerColumns: [
    {
      heading: 'Pages',
      links: [
        navLink('Home', AppRoute.Home),
        SHOWS,
        TEAM,
        VIDEOS,
        ACHIEVEMENTS,
        MOBILE_SECTIONS.gallery,
      ],
    },
  ],
  promo: PromoVariant.Card,
  showWhatsAppFab: true,
};

/** Chrome per layout; `Bare` (admin) renders none. Add a layout by adding an entry. */
export const LAYOUT_CHROME: Readonly<Record<PageLayout, ILayoutChrome | null>> = {
  [PageLayout.Home]: HOME_CHROME,
  [PageLayout.Page]: PAGE_CHROME,
  [PageLayout.Bare]: null,
};
