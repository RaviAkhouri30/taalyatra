import { type Locator } from '@playwright/test';
import { type InnerPageName, expect, test } from '../fixtures/test';

/** Each inner page, its title and heading, and the home teaser link that leads to it. */
const PAGES: readonly {
  name: InnerPageName;
  title: string;
  heading: string;
  teaser: { anchor: string; link: string };
}[] = [
  {
    name: 'videos',
    title: 'Videos — Taal Yatra',
    heading: 'Watch the beat in action.',
    teaser: { anchor: 'watch', link: 'View all videos' },
  },
  {
    name: 'team',
    title: 'Our team — Taal Yatra',
    heading: 'The people behind the beat.',
    teaser: { anchor: 'team', link: 'Meet the whole team' },
  },
  {
    name: 'shows',
    title: 'Shows & performances — Taal Yatra',
    heading: 'Not just workshops — live music too.',
    teaser: { anchor: 'shows', link: 'See all formats' },
  },
  {
    name: 'achievements',
    title: 'Achievements — Taal Yatra',
    heading: 'Years of stages, students and sound.',
    teaser: { anchor: 'proof', link: 'All achievements' },
  },
];

test.describe('Inner pages', () => {
  for (const { name, title, heading, teaser } of PAGES) {
    test(`should open ${title} directly, with the footer credit`, async ({ innerPages }) => {
      const inner = innerPages[name];
      await inner.open();

      await expect(inner.page).toHaveTitle(title);
      await expect(inner.heading).toHaveText(heading);
      await expect(inner.page.getByRole('contentinfo')).toContainText(
        'Developed with love by Ravi Akhouri',
      );
    });

    test(`should reach ${title} from the home teaser`, async ({ home, innerPages }) => {
      await home.open(teaser.anchor);
      const link: Locator = home.section(teaser.anchor).getByRole('link', { name: teaser.link });

      await link.click();

      await expect(innerPages[name].heading).toHaveText(heading);
    });

    test(`should have no WCAG 2.2 AA violations on ${title}`, async ({ innerPages, axe }) => {
      const inner = innerPages[name];
      await inner.open();
      await expect(inner.heading).toBeVisible();

      const results = await axe().analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
