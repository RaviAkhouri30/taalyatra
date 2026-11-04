import {
  COLLECTION_MAX_ITEMS,
  CONTENT_MAX_LENGTH,
  EXPERIENCES_MAX_ITEMS,
} from '@shared/constants/content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { COLLECTION_ITEMS_FIELD } from '../models/collection-expander';
import { ContentPath } from '../models/content-path.enum';
import {
  EXPERIENCE_CARDS_FIELD,
  EXPERIENCES_VIEW,
  FEATURED_CTA_DEFAULT,
} from '../models/experiences-view';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema, type IListFieldSchema } from '../models/i-field-schema';
import { IMAGE_ASPECT } from '../models/image-aspect.constants';
import { HEADING_FIELDS, buttonLabel, image, multiline, text } from './schema-fields';

const { eyebrow, title, lead } = HEADING_FIELDS;

/** Short labels on a skill chip, so they stay on one line. */
const SKILL_MAX_LENGTH = 40;

/** Each collection's one list field, stored in the draft's list envelope (D15). */
function items(
  label: string,
  addLabel: string,
  maxItems: number,
  item: IListFieldSchema['item'],
): IListFieldSchema {
  return { key: COLLECTION_ITEMS_FIELD, label, kind: FieldKind.List, addLabel, maxItems, item };
}

function group(label: string, fields: readonly FieldSchema[]): IListFieldSchema['item'] {
  return { key: 'item', label, kind: FieldKind.Group, fields };
}

/** The Experiences tab: like the Shows tab, over a document stored as one featured card and a list. */
export const EXPERIENCES_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'experiences',
    title: 'Experiences heading',
    path: ContentPath.HomeExperiences,
    anchor: PageAnchor.Experiences,
    fields: [eyebrow, title, lead],
  },
  {
    id: 'experiences-cards',
    title: 'Experiences',
    path: ContentPath.HomeExperiences,
    anchor: PageAnchor.Experiences,
    view: EXPERIENCES_VIEW,
    tip: 'The featured experience gets the large card. The categories become the filters.',
    fields: [
      {
        key: EXPERIENCE_CARDS_FIELD,
        label: 'Experiences',
        kind: FieldKind.List,
        addLabel: 'Add experience',
        maxItems: EXPERIENCES_MAX_ITEMS,
        minItems: 1,
        item: group('Experience', [
          text('name', 'Name', { required: true, maxLength: CONTENT_MAX_LENGTH.experienceName }),
          text('tag', 'Small label above the name', {
            maxLength: CONTENT_MAX_LENGTH.experienceTag,
          }),
          text('category', 'Category', {
            required: true,
            maxLength: CONTENT_MAX_LENGTH.experienceCategory,
            hint: 'Experiences with the same category are filtered together.',
          }),
          image('image', 'Image', IMAGE_ASPECT.experiences),
          multiline('description', 'Description', {
            maxLength: CONTENT_MAX_LENGTH.experienceDescription,
          }),
          text('duration', 'Duration', { maxLength: CONTENT_MAX_LENGTH.experienceDetail }),
          text('groupSize', 'Group size', { maxLength: CONTENT_MAX_LENGTH.experienceDetail }),
          text('venue', 'Venue', { maxLength: CONTENT_MAX_LENGTH.experienceDetail }),
          {
            key: 'featured',
            label: 'Featured',
            kind: FieldKind.Toggle,
            offByDefault: true,
            oneInList: true,
            hint: 'One experience is always featured. Switch another on to move it.',
          },
          {
            key: 'spotlight',
            label: 'Featured card',
            kind: FieldKind.Group,
            onlyWhen: 'featured',
            fields: [buttonLabel('cta', 'Button on the card', FEATURED_CTA_DEFAULT)],
          },
        ]),
      },
    ],
  },
];

/** The Gallery tab (E1). */
export const GALLERY_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'gallery-heading',
    title: 'Gallery heading',
    path: ContentPath.HomeGallery,
    anchor: PageAnchor.Gallery,
    fields: [
      eyebrow,
      title,
      buttonLabel('cta', 'Button'),
      text('moreLabel', 'Link to more photos', { required: true, maxLength: 40 }),
      { ...text('moreUrl', 'Where that link goes'), kind: FieldKind.Url },
      multiline('note', 'Note under the photos', { maxLength: 200 }),
    ],
  },
  {
    id: 'gallery-photos',
    title: 'Photos',
    path: ContentPath.Gallery,
    anchor: PageAnchor.Gallery,
    tip: 'Move your best photo to the top: it’s shown largest.',
    fields: [
      items(
        'Photos',
        'Add photo',
        COLLECTION_MAX_ITEMS.gallery,
        image('photo', 'Photo', IMAGE_ASPECT.gallery),
      ),
    ],
  },
];

/** The Team tab (E2). */
export const TEAM_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'team-members',
    title: 'Team members',
    path: ContentPath.Team,
    anchor: PageAnchor.Team,
    tip: 'The first four people also appear on the home page.',
    fields: [
      items(
        'Team members',
        'Add team member',
        COLLECTION_MAX_ITEMS.team,
        group('Team member', [
          text('name', 'Name', { required: true, maxLength: CONTENT_MAX_LENGTH.memberName }),
          text('role', 'Role', { maxLength: CONTENT_MAX_LENGTH.memberRole }),
          multiline('bio', 'Short bio', { maxLength: CONTENT_MAX_LENGTH.memberBio }),
          {
            key: 'skills',
            label: 'Skills',
            kind: FieldKind.List,
            addLabel: 'Add skill',
            maxItems: CONTENT_MAX_LENGTH.memberSkills,
            item: text('skill', 'Skill', { required: true, maxLength: SKILL_MAX_LENGTH }),
          },
          text('funFact', 'Fun fact', { maxLength: CONTENT_MAX_LENGTH.memberFunFact }),
          image('photo', 'Photo', IMAGE_ASPECT.team),
        ]),
      ),
    ],
  },
];

/** The Shows tab (E3). */
export const SHOWS_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'shows-heading',
    title: 'Shows heading',
    path: ContentPath.HomeShows,
    anchor: PageAnchor.Shows,
    fields: [eyebrow, title, lead, buttonLabel('cta', 'Link to the Shows page')],
  },
  {
    id: 'shows-formats',
    title: 'Show formats',
    path: ContentPath.ShowFormats,
    anchor: PageAnchor.Shows,
    tip: 'One show can be featured: it gets the spotlight above the others.',
    fields: [
      items(
        'Show formats',
        'Add show',
        COLLECTION_MAX_ITEMS.showFormats,
        group('Show', [
          {
            key: 'icon',
            label: 'Icon',
            kind: FieldKind.Choice,
            options: [
              { value: 'sparkle', label: 'Sparkle' },
              { value: 'djembe', label: 'Djembe' },
              { value: 'guitar', label: 'Guitar' },
              { value: 'mic', label: 'Microphone' },
              { value: 'procession', label: 'Procession' },
              { value: 'pulse', label: 'Pulse' },
              { value: 'star', label: 'Star' },
            ],
          },
          text('title', 'Name', { required: true, maxLength: CONTENT_MAX_LENGTH.showTitle }),
          multiline('text', 'Description', { maxLength: CONTENT_MAX_LENGTH.showText }),
          text('ensemble', 'Ensemble', { maxLength: CONTENT_MAX_LENGTH.showEnsemble }),
          text('setLength', 'Set length', { maxLength: CONTENT_MAX_LENGTH.showSetLength }),
          text('bestFor', 'Best for', { maxLength: CONTENT_MAX_LENGTH.showBestFor }),
          image('image', 'Image', IMAGE_ASPECT.shows),
          { key: 'featured', label: 'Featured', kind: FieldKind.Toggle, offByDefault: true },
          {
            key: 'spotlight',
            label: 'Spotlight text',
            kind: FieldKind.Group,
            onlyWhen: 'featured',
            fields: [
              text('eyebrow', 'Small heading', { maxLength: CONTENT_MAX_LENGTH.eyebrow }),
              text('title', 'Title', { required: true, maxLength: CONTENT_MAX_LENGTH.title }),
              buttonLabel('primaryCta', 'Button to the proposal form', 'Book a concert'),
              buttonLabel('secondaryCta', 'Button to the Videos page', 'Watch a recital'),
            ],
          },
        ]),
      ),
    ],
  },
];

/** The Videos tab (E5). */
export const VIDEOS_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'videos-list',
    title: 'Videos',
    path: ContentPath.Videos,
    anchor: PageAnchor.Watch,
    tip: 'The first video is the featured one, so move your best to the top.',
    fields: [
      items(
        'Videos',
        'Add video',
        COLLECTION_MAX_ITEMS.videos,
        group('Video', [
          {
            ...text('url', 'YouTube link', {
              required: true,
              maxLength: CONTENT_MAX_LENGTH.videoUrl,
            }),
            kind: FieldKind.Url,
          },
          text('title', 'Title', { required: true, maxLength: CONTENT_MAX_LENGTH.videoTitle }),
          text('category', 'Category', {
            maxLength: CONTENT_MAX_LENGTH.videoCategory,
            hint: 'Videos with the same category are filtered together on the Videos page.',
          }),
          text('caption', 'Caption', { maxLength: CONTENT_MAX_LENGTH.videoCaption }),
          text('duration', 'Length', {
            maxLength: CONTENT_MAX_LENGTH.videoDuration,
            hint: 'For example 3:42.',
          }),
          image('image', 'Thumbnail', IMAGE_ASPECT.videos, {
            decorative: true,
            thumbnailFromLink: 'url',
          }),
        ]),
      ),
    ],
  },
];
