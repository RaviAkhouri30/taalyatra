import { PAGE_MAX_ITEMS, PAGE_MAX_LENGTH } from '@shared/constants/page-content-limits.constants';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema } from '../models/i-field-schema';
import {
  CARD_TEXT,
  CARD_TITLE,
  HOME_ICON_FIELD,
  LIST_EYEBROW,
  LIST_TITLE,
  groupList,
} from './home-parts';
import { PAGE_CTA_FIELD, PAGE_HERO_FIELD, group } from './page-parts';
import { text } from './schema-fields';

const L = PAGE_MAX_LENGTH;

const YEAR = text('year', 'Year', { maxLength: L.year });

/**
 * @param id The card's id.
 * @param title The card's heading.
 * @param fields Its fields.
 * @returns A card of the Achievements page.
 */
function card(id: string, title: string, fields: readonly FieldSchema[]): IEditorSection {
  return {
    id,
    title,
    path: ContentPath.PagesAchievements,
    anchor: PageAnchor.Top,
    page: AppRoute.Achievements,
    fields,
  };
}

/**
 * @param key The stored key.
 * @param names The list's label, the button's label and one item's label.
 * @param maxItems The most items it holds.
 * @param fields One item's fields.
 * @returns One of the page's titled lists (`IAchievementSectionDto`): heading and items.
 */
function titledList(
  key: string,
  names: readonly [string, string, string],
  maxItems: number,
  fields: readonly FieldSchema[],
): FieldSchema {
  return group(key, names[0], [
    LIST_EYEBROW,
    LIST_TITLE,
    groupList('items', names, maxItems, fields),
  ]);
}

/** The Achievements page (0028): one card per part of the page, top to bottom. */
export const ACHIEVEMENTS_SECTIONS: readonly IEditorSection[] = [
  card('achievements-heading', 'Page heading and numbers', [
    PAGE_HERO_FIELD,
    groupList('stats', ['Numbers', 'Add number', 'Number'], PAGE_MAX_ITEMS.stats, [
      text('value', 'Value', { required: true, maxLength: L.statValue, hint: 'e.g. 20+' }),
      text('label', 'Label', { required: true, maxLength: L.statLabel }),
    ]),
  ]),
  card('achievements-milestones', 'Milestones', [
    titledList(
      'milestones',
      ['Milestones', 'Add milestone', 'Milestone'],
      PAGE_MAX_ITEMS.milestones,
      [
        { ...YEAR, required: true, hint: 'A year, or a word such as Today.' },
        CARD_TITLE,
        CARD_TEXT,
      ],
    ),
  ]),
  card('achievements-recognition', 'Recognition', [
    titledList('recognition', ['Recognition', 'Add award', 'Award'], PAGE_MAX_ITEMS.recognition, [
      HOME_ICON_FIELD,
      CARD_TITLE,
      CARD_TEXT,
    ]),
  ]),
  card('achievements-press', 'Press', [
    titledList('press', ['Press', 'Add article', 'Article'], PAGE_MAX_ITEMS.press, [
      text('publication', 'Publication', { required: true, maxLength: L.publication }),
      text('headline', 'Headline', { maxLength: L.headline }),
      YEAR,
      {
        key: 'url',
        label: 'Link to the article',
        kind: FieldKind.Url,
        maxLength: L.url,
        hint: 'Leave empty until it’s online.',
      },
    ]),
  ]),
  card('achievements-performances', 'Performances', [
    titledList(
      'performances',
      ['Performances', 'Add performance', 'Performance'],
      PAGE_MAX_ITEMS.performances,
      [
        text('event', 'Event', { required: true, maxLength: L.event }),
        text('venue', 'Venue', { maxLength: L.venue }),
        YEAR,
      ],
    ),
  ]),
  card('achievements-cta', 'Call to action', [PAGE_CTA_FIELD]),
];
