import { PAGE_META } from '@shared/constants/page-meta.constants';
import { SEO_MAX_LENGTH } from '@shared/constants/page-content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SeoPage } from '@shared/enums/seo-page.enum';
import { type ISeoText } from '@shared/interfaces/i-seo-text';
import { ContentPath } from '../models/content-path.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { group } from './page-parts';
import { multiline, text } from './schema-fields';

/** The pages, in menu order, with the names the owner knows them by and their defaults. */
const SEO_PAGES: readonly (readonly [SeoPage, string, ISeoText])[] = [
  [SeoPage.Home, 'Home page', PAGE_META[SeoPage.Home]],
  [SeoPage.Videos, 'Videos page', PAGE_META[SeoPage.Videos]],
  [SeoPage.Team, 'Team page', PAGE_META[SeoPage.Team]],
  [SeoPage.Shows, 'Shows page', PAGE_META[SeoPage.Shows]],
  [SeoPage.Achievements, 'Achievements page', PAGE_META[SeoPage.Achievements]],
];

/**
 * Each page's title and search description (0028), stored in `site/config.seo`. An empty field
 * keeps the page's default, which its hint shows.
 */
export const SEO_SECTION: IEditorSection = {
  id: 'seo',
  title: 'Search and sharing',
  path: ContentPath.SiteConfig,
  anchor: PageAnchor.Top,
  tip: 'Google shows about 60 characters of a title and 155 of a description. The title is also the browser tab’s, and both show when a link is shared.',
  fields: [
    group(
      'seo',
      'Pages',
      SEO_PAGES.map(([page, name, defaults]) =>
        group(page, name, [
          text('title', 'Title', {
            maxLength: SEO_MAX_LENGTH.title,
            recommended: SEO_MAX_LENGTH.titleRecommended,
            hint: `Leave empty to keep: ${defaults.title}`,
          }),
          multiline('description', 'Search description', {
            maxLength: SEO_MAX_LENGTH.description,
            recommended: SEO_MAX_LENGTH.descriptionRecommended,
            hint: `Leave empty to keep: ${defaults.description}`,
          }),
        ]),
      ),
    ),
  ],
};
