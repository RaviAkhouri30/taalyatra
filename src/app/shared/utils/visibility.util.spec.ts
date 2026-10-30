import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { HOME_CHROME, PAGE_CHROME } from '@shared/testing/fixtures';
import { externalLink, navLink } from './link.util';
import { applyVisibility, isLinkVisible } from './visibility.util';

describe('visibility util', () => {
  const galleryOff = new SiteVisibility({ sections: { gallery: false } });
  const teamPageOff = new SiteVisibility({ pages: { team: false } });

  describe('isLinkVisible', () => {
    it('should keep an external link whatever is switched off', () => {
      const link = externalLink('Instagram', 'https://instagram.com/taalyatra');

      expect(isLinkVisible(link, new SiteVisibility({ pages: { team: false } }))).toBe(true);
    });

    it('should drop a link to a switched-off page', () => {
      expect(isLinkVisible(navLink('Team', AppRoute.Team), teamPageOff)).toBe(false);
    });

    it('should drop a link to a hidden home section', () => {
      const link = navLink('Gallery', AppRoute.Home, { fragment: PageAnchor.Gallery });

      expect(isLinkVisible(link, galleryOff)).toBe(false);
    });

    it('should keep a link to an anchor no switch controls when everything is off', () => {
      const link = navLink('Contact', AppRoute.Home, { fragment: PageAnchor.Contact });
      const allOff = new SiteVisibility({ sections: { gallery: false, faq: false } });

      expect(isLinkVisible(link, allOff)).toBe(true);
    });
  });

  describe('applyVisibility', () => {
    it('should return the same links when everything is shown', () => {
      expect(applyVisibility(HOME_CHROME, SiteVisibility.allVisible)).toEqual(HOME_CHROME);
    });

    it('should drop a switched-off page from the menus and the footer', () => {
      const chrome = applyVisibility(HOME_CHROME, teamPageOff);
      const footerLinks = chrome.footerColumns.flatMap((column) => column.links);

      expect(chrome.mainNav.map((link) => link.label)).not.toContain('Team');
      expect(chrome.mobileNav.map((link) => link.label)).not.toContain('Team');
      expect(footerLinks.map((link) => link.label)).not.toContain('Team');
    });

    it('should drop a footer column whose links are all hidden', () => {
      const chrome = {
        ...PAGE_CHROME,
        footerColumns: [{ heading: 'Only team', links: [navLink('Team', AppRoute.Team)] }],
      };

      expect(applyVisibility(chrome, teamPageOff).footerColumns).toEqual([]);
    });

    it('should hide the floating WhatsApp button when it is switched off', () => {
      const whatsAppOff = new SiteVisibility({ widgets: { whatsApp: false } });

      expect(applyVisibility(PAGE_CHROME, whatsAppOff).showWhatsAppFab).toBe(false);
    });
  });
});
