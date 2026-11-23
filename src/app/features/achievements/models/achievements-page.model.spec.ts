import { IconName } from '@shared/enums/icon-name.enum';
import { PAGES } from '@shared/testing/fixtures';
import { AchievementsPageModel } from './achievements-page.model';

describe('AchievementsPageModel', () => {
  it('should resolve recognition icons and keep the other sections as stored', () => {
    const page = new AchievementsPageModel(PAGES.achievements);

    expect(page.stats).toHaveLength(4);
    expect(page.milestones.items.at(-1)?.year).toBe('Today');
    expect(page.recognition.items.every((item) => item.icon === IconName.Star)).toBe(true);
    expect(page.performances.items).toHaveLength(5);
  });

  it('should leave a hidden milestone out (2.15.0)', () => {
    const milestones = PAGES.achievements.milestones;
    const page = new AchievementsPageModel({
      ...PAGES.achievements,
      milestones: {
        ...milestones,
        items: milestones.items.map((item, index) => ({ ...item, hidden: index === 0 })),
      },
    });

    expect(page.milestones.items).toHaveLength(milestones.items.length - 1);
    expect(page.milestones.items[0]?.title).toBe(milestones.items[1]?.title);
  });

  it('should keep a press link only when the article is known', () => {
    const page = new AchievementsPageModel({
      ...PAGES.achievements,
      press: {
        ...PAGES.achievements.press,
        items: [
          { publication: 'P', headline: 'H', year: '2024', url: 'https://news.test/a' },
          { publication: 'Q', headline: 'I', year: '2025', url: '' },
        ],
      },
    });

    expect(page.press.items.map((item) => item.url)).toEqual(['https://news.test/a', null]);
  });

  it('should link the closing buttons to the proposal form and the Shows page', () => {
    const page = new AchievementsPageModel(PAGES.achievements);

    expect(page.request.fragment).toBe('contact');
    expect(page.shows.route).toBe('/shows');
  });
});
