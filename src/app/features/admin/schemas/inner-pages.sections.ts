import { PAGE_MAX_ITEMS, PAGE_MAX_LENGTH } from '@shared/constants/page-content-limits.constants';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { type IEditorSection } from '../models/i-editor-section';
import {
  CARD_TEXT,
  CARD_TITLE,
  ITEM_NUMBER,
  LIST_EYEBROW,
  LIST_TITLE,
  groupList,
} from './home-parts';
import { PAGE_CTA_FIELD, PAGE_HERO_FIELD, group } from './page-parts';
import { buttonLabel, multiline, text } from './schema-fields';

const L = PAGE_MAX_LENGTH;

/** @returns A short label the site shows or reads out. */
function label(key: string, name: string, hint?: string): ReturnType<typeof text> {
  return text(key, name, {
    required: true,
    maxLength: L.label,
    ...(hint === undefined ? {} : { hint }),
  });
}

/** The Videos page's own text (0028); the videos themselves are on the same editor page. */
export const VIDEOS_PAGE_SECTION: IEditorSection = {
  id: 'videos-page',
  title: 'Videos page',
  path: ContentPath.PagesVideos,
  anchor: PageAnchor.Top,
  page: AppRoute.Videos,
  tip: 'Words in braces, like {count}, are filled in by the site: keep them as they are.',
  fields: [
    PAGE_HERO_FIELD,
    label('filterLabel', 'What screen readers hear for the filter'),
    label('allLabel', 'Filter button that shows every video'),
    label('showingLabel', 'How many videos show', '{count} becomes the number of videos.'),
    label('featuredLabel', 'Line above the featured video', '{category} becomes its category.'),
    buttonLabel('channelCta', 'YouTube channel button'),
    buttonLabel('planCta', 'Proposal button'),
  ],
};

/** The Team page's own text (0028); the members are on the same editor page. */
export const TEAM_PAGE_SECTION: IEditorSection = {
  id: 'team-page',
  title: 'Team page',
  path: ContentPath.PagesTeam,
  anchor: PageAnchor.Top,
  page: AppRoute.Team,
  fields: [
    PAGE_HERO_FIELD,
    label('funFactLabel', 'Label before each fun fact', 'e.g. Fun fact:'),
    group('values', 'How we show up', [
      LIST_EYEBROW,
      LIST_TITLE,
      groupList('items', ['Habits', 'Add habit', 'Habit'], PAGE_MAX_ITEMS.teamValues, [
        CARD_TITLE,
        CARD_TEXT,
      ]),
    ]),
    PAGE_CTA_FIELD,
  ],
};

/** The Shows page's own text (0028); the show formats are on the same editor page. */
export const SHOWS_PAGE_SECTION: IEditorSection = {
  id: 'shows-page',
  title: 'Shows page',
  path: ContentPath.PagesShows,
  anchor: PageAnchor.Top,
  page: AppRoute.Shows,
  fields: [
    PAGE_HERO_FIELD,
    buttonLabel('heroPrimaryCta', 'Main button'),
    buttonLabel('heroWhatsAppCta', 'WhatsApp button'),
    group('formats', 'Formats', [
      LIST_EYEBROW,
      LIST_TITLE,
      multiline('note', 'Note below the formats', { maxLength: L.note }),
      group('labels', 'Labels of each format’s details', [
        label('ensemble', 'Ensemble'),
        label('setLength', 'Set length'),
        label('bestFor', 'Best for'),
      ]),
    ]),
    group('setups', 'Setups', [
      LIST_EYEBROW,
      LIST_TITLE,
      groupList('items', ['Setups', 'Add setup', 'Setup'], PAGE_MAX_ITEMS.setups, [
        CARD_TITLE,
        CARD_TEXT,
      ]),
      multiline('note', 'Note below the setups', { maxLength: L.note }),
    ]),
    group('process', 'How a show comes together', [
      LIST_EYEBROW,
      LIST_TITLE,
      groupList('steps', ['Steps', 'Add step', 'Step'], PAGE_MAX_ITEMS.showSteps, [
        ITEM_NUMBER,
        CARD_TITLE,
        CARD_TEXT,
      ]),
      buttonLabel('primaryCta', 'Main button'),
      buttonLabel('secondaryCta', 'Second button'),
    ]),
  ],
};
