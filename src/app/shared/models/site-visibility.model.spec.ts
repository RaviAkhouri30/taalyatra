import { HomeSection } from '@shared/enums/home-section.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type ISiteVisibilityDto } from '@shared/interfaces/i-site-visibility';
import { SiteVisibility } from './site-visibility.model';

describe('SiteVisibility', () => {
  it('should show everything when nothing is stored', () => {
    const visibility = SiteVisibility.allVisible;

    expect(visibility.isSectionVisible(HomeSection.Gallery)).toBe(true);
    expect(visibility.isPageVisible(SitePage.Team)).toBe(true);
    expect(visibility.isWidgetVisible(SiteWidget.Assistant)).toBe(true);
  });

  it('should hide only what is switched off when some switches are false', () => {
    const visibility = new SiteVisibility({
      sections: { gallery: false, faq: true },
      pages: { team: false },
      widgets: { intro: false },
    });

    expect(visibility.isSectionVisible(HomeSection.Gallery)).toBe(false);
    expect(visibility.isSectionVisible(HomeSection.Faq)).toBe(true);
    expect(visibility.isPageVisible(SitePage.Team)).toBe(false);
    expect(visibility.isPageVisible(SitePage.Videos)).toBe(true);
    expect(visibility.isWidgetVisible(SiteWidget.Intro)).toBe(false);
  });

  it('should show a section when its stored value is not a boolean', () => {
    const malformed = { sections: { gallery: 'no' } } as unknown as ISiteVisibilityDto;

    expect(new SiteVisibility(malformed).isSectionVisible(HomeSection.Gallery)).toBe(true);
  });
});
