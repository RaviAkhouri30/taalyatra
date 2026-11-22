import { HOME_MAX_ITEMS, HOME_MAX_LENGTH } from '@shared/constants/home-content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { COLLECTION_ITEMS_FIELD } from '../models/collection-expander';
import {
  CARD_TEXT,
  CARD_TITLE,
  HOME_ICON_FIELD,
  ITEM_NUMBER,
  LIST_EYEBROW,
  LIST_TITLE,
  groupList,
} from './home-parts';
import { HEADING_FIELDS, buttonLabel, text } from './schema-fields';

const { eyebrow, title, lead } = HEADING_FIELDS;

/** The scrolling words under the hero (0028), stored as a list: the document is `{ _items }`. */
export const MARQUEE_SECTION: IEditorSection = {
  id: 'marquee',
  title: 'Scrolling words',
  path: ContentPath.HomeMarquee,
  anchor: PageAnchor.Top,
  tip: 'The words that scroll across under the hero. Short ones read best.',
  fields: [
    {
      key: COLLECTION_ITEMS_FIELD,
      label: 'Words',
      kind: FieldKind.List,
      addLabel: 'Add word',
      maxItems: HOME_MAX_ITEMS.marquee,
      item: text('word', 'Word', { required: true, maxLength: HOME_MAX_LENGTH.word }),
    },
  ],
};

/** The trust strip under the scrolling words (0028), stored as a list. */
export const TRUST_SECTION: IEditorSection = {
  id: 'trust',
  title: 'Trust strip',
  path: ContentPath.HomeTrust,
  anchor: PageAnchor.Top,
  tip: 'Four short reasons to trust you, side by side under the hero.',
  fields: [
    groupList(COLLECTION_ITEMS_FIELD, ['Reasons', 'Add reason', 'Reason'], HOME_MAX_ITEMS.trust, [
      HOME_ICON_FIELD,
      CARD_TITLE,
      CARD_TEXT,
    ]),
  ],
};

/** The cards of "Who it's for" (0028), below its heading, in the same document. */
export const AUDIENCE_CARDS_SECTION: IEditorSection = {
  id: 'audience-cards',
  title: 'Cards',
  path: ContentPath.HomeAudiences,
  anchor: PageAnchor.ForEveryone,
  fields: [
    groupList('cards', ['Cards', 'Add card', 'Card'], HOME_MAX_ITEMS.audiences, [
      HOME_ICON_FIELD,
      CARD_TITLE,
      CARD_TEXT,
      {
        key: 'tags',
        label: 'Tags',
        kind: FieldKind.List,
        addLabel: 'Add tag',
        maxItems: HOME_MAX_ITEMS.audienceTags,
        item: text('tag', 'Tag', { required: true, maxLength: HOME_MAX_LENGTH.tag }),
      },
    ]),
  ],
};

/**
 * @param key The stored key: `goals` or `journey`.
 * @param names Its card's title, and one item's label.
 * @param maxItems The most items it holds.
 * @param first The item's first field: its number, or when it happened.
 * @returns A card editing one of the philosophy's titled lists.
 */
function titledList(
  key: string,
  [cardTitle, itemLabel]: readonly [string, string],
  maxItems: number,
  first: ReturnType<typeof text>,
): IEditorSection {
  return {
    id: `philosophy-${key}`,
    title: cardTitle,
    path: ContentPath.HomePhilosophy,
    anchor: PageAnchor.Philosophy,
    fields: [
      {
        key,
        label: cardTitle,
        kind: FieldKind.Group,
        fields: [
          LIST_EYEBROW,
          LIST_TITLE,
          groupList(
            'items',
            [itemLabel + 's', `Add ${itemLabel.toLowerCase()}`, itemLabel],
            maxItems,
            [first, CARD_TITLE, CARD_TEXT],
          ),
        ],
      },
    ],
  };
}

/** The Our philosophy page (0028): the section's four cards, then the call to action below it. */
export const PHILOSOPHY_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'philosophy',
    title: 'Section heading and pillars',
    path: ContentPath.HomePhilosophy,
    anchor: PageAnchor.Philosophy,
    fields: [
      eyebrow,
      title,
      lead,
      groupList('pillars', ['Pillars', 'Add pillar', 'Pillar'], HOME_MAX_ITEMS.pillars, [
        CARD_TITLE,
        CARD_TEXT,
      ]),
    ],
  },
  titledList('goals', ['Goals', 'Goal'], HOME_MAX_ITEMS.goals, ITEM_NUMBER),
  titledList(
    'journey',
    ['Journey', 'Milestone'],
    HOME_MAX_ITEMS.journey,
    text('when', 'When', {
      maxLength: HOME_MAX_LENGTH.when,
      hint: 'A year, or a word like Today.',
    }),
  ),
  {
    id: 'mid-cta',
    title: 'Call to action below it',
    path: ContentPath.HomeMidCta,
    anchor: PageAnchor.Philosophy,
    tip: 'The band with two buttons between Our philosophy and Where we play.',
    fields: [
      eyebrow,
      title,
      buttonLabel('primaryCta', 'Main button', 'Request proposal'),
      buttonLabel('whatsAppCta', 'WhatsApp button', 'WhatsApp us'),
    ],
  },
];
