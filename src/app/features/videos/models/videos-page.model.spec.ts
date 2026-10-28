import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PAGES, SITE, SITE_DTO, VIDEOS_FIXTURE } from '@shared/testing/fixtures';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { VideosPageModel } from './videos-page.model';

describe('VideosPageModel', () => {
  const page = () => new VideosPageModel(PAGES.videos, VIDEOS_FIXTURE, SITE);

  it('should derive the categories from the videos, after "All", in first-appearance order', () => {
    expect(page().categories).toEqual([
      'All',
      'Corporate',
      'Family',
      'Workshops',
      'Behind the scenes',
    ]);
  });

  it('should return every card for "All" and only matching cards for a category', () => {
    expect(page().cardsIn('All')).toHaveLength(VIDEOS_FIXTURE.length);
    expect(
      page()
        .cardsIn('Family')
        .map((card) => card.video.category),
    ).toEqual(['Family', 'Family']);
  });

  it('should name each card with the shared watch label', () => {
    expect(page().cardsIn('All')[0]?.ariaLabel).toBe('Watch [Video title 1] on YouTube');
  });

  it('should format the count and the featured label', () => {
    const model = page();
    const [first] = model.cardsIn('All');

    expect(model.countLabel(3)).toBe('Showing 3 videos');
    expect(first && model.featuredLabel(first)).toBe('Featured · Corporate');
  });

  it('should link to the YouTube profile and to the proposal form', () => {
    const model = page();

    expect(model.channel).toMatchObject({
      label: 'Visit our YouTube channel',
      href: 'https://www.youtube.com/',
    });
    expect(model.plan).toMatchObject({ route: AppRoute.Home, fragment: PageAnchor.Contact });
  });

  it('should have no channel link when the site has no YouTube profile', () => {
    const site = new SiteConfigModel({ ...SITE_DTO, socials: [] });

    expect(new VideosPageModel(PAGES.videos, VIDEOS_FIXTURE, site).channel).toBeNull();
  });
});
