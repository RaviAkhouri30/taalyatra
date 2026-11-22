import { SeoPage } from '@shared/enums/seo-page.enum';
import { type ISeoText } from '@shared/interfaces/i-seo-text';

/**
 * Each page's default title and search description (0028). The routes read them, and the admin's
 * Search and sharing page shows them under its fields, so both say the same thing. The owner's own
 * text, stored in `site/config.seo`, takes their place.
 */
export const PAGE_META: Readonly<Record<SeoPage, ISeoText>> = {
  [SeoPage.Home]: {
    title: 'Taal Yatra — Drum circles and music workshops in Pune',
    description:
      'Drum circles, music workshops and live shows for teams, families and festivals in Pune. Request a proposal in minutes.',
  },
  [SeoPage.Videos]: {
    title: 'Videos — Taal Yatra',
    description:
      'Watch Taal Yatra drum circles, workshops and shows: corporate days, family functions and festivals in Pune.',
  },
  [SeoPage.Team]: {
    title: 'Our team — Taal Yatra',
    description:
      'Meet the facilitators, percussionists and event makers behind Taal Yatra drum circles in Pune.',
  },
  [SeoPage.Shows]: {
    title: 'Shows & performances — Taal Yatra',
    description:
      'Live band, percussion ensemble, acoustic, fusion, dhol procession and classical tabla shows for your event in Pune.',
  },
  [SeoPage.Achievements]: {
    title: 'Achievements — Taal Yatra',
    description:
      'Milestones, awards, press and notable performances from Taal Yatra’s years of stages, students and sound.',
  },
};
