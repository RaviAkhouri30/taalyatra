import { HOME_MAX_ITEMS, HOME_MAX_LENGTH } from '@shared/constants/home-content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type ITextFieldSchema, type IToggleFieldSchema } from '../models/i-field-schema';
import { IMAGE_ASPECT } from '../models/image-aspect.constants';
import { CARD_TEXT, CARD_TITLE, ITEM_NUMBER, groupList } from './home-parts';
import { hideable } from './hideable';
import { HEADING_FIELDS, buttonLabel, image, multiline, text } from './schema-fields';

const { eyebrow, title, lead } = HEADING_FIELDS;
const L = HOME_MAX_LENGTH;

/** @returns A link field. */
function link(key: string, label: string, required = false): ITextFieldSchema {
  return { key, label, kind: FieldKind.Url, required, maxLength: L.url };
}

/** @returns A switch that's off unless turned on. */
function offSwitch(key: string, label: string, hint: string): IToggleFieldSchema {
  return { key, label, kind: FieldKind.Toggle, offByDefault: true, hint };
}

/** Where we play (0028). */
export const CITIES_SECTION: IEditorSection = {
  id: 'cities',
  title: 'Where we play',
  path: ContentPath.HomeCities,
  anchor: PageAnchor.Cities,
  fields: [
    eyebrow,
    title,
    lead,
    groupList('cities', ['Cities', 'Add city', 'City'], HOME_MAX_ITEMS.cities, [
      text('name', 'Name', { required: true, maxLength: L.city }),
      offSwitch('active', 'Highlighted', 'Shown in the accent colour, e.g. your home city.'),
    ]),
  ],
};

/** How it works (0028). */
export const HOW_SECTION: IEditorSection = {
  id: 'how',
  title: 'How it works',
  path: ContentPath.HomeHow,
  anchor: PageAnchor.How,
  fields: [
    eyebrow,
    title,
    groupList('steps', ['Steps', 'Add step', 'Step'], HOME_MAX_ITEMS.steps, [
      ITEM_NUMBER,
      CARD_TITLE,
      CARD_TEXT,
    ]),
  ],
};

/** The Instagram posts (0028). Each links to the post; the photo comes from the library. */
export const INSTAGRAM_SECTION: IEditorSection = {
  id: 'instagram',
  title: 'Instagram',
  path: ContentPath.HomeInstagram,
  anchor: PageAnchor.Insta,
  tip: 'Pick a photo from the library for each post, and paste the post’s link.',
  fields: [
    eyebrow,
    title,
    buttonLabel('followLabel', 'Follow button'),
    link('profileUrl', 'Your Instagram profile link', true),
    text('postLabel', 'What screen readers hear for each post’s link', {
      maxLength: L.label,
    }),
    groupList('posts', ['Posts', 'Add post', 'Post'], HOME_MAX_ITEMS.posts, [
      image('image', 'Photo', IMAGE_ASPECT.instagram, {
        decorative: true,
        hint: 'The caption describes it, so a description is optional.',
      }),
      multiline('caption', 'Caption', { maxLength: L.caption }),
      link('url', 'Link to the post', true),
    ]),
  ],
};

/** Testimonials, with the numbers above them and the clients below (0028; the site's `proof`). */
export const TESTIMONIALS_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'proof',
    title: 'Section heading and numbers',
    path: ContentPath.HomeProof,
    anchor: PageAnchor.Proof,
    fields: [
      eyebrow,
      title,
      buttonLabel('cta', 'Link to the Achievements page'),
      groupList('stats', ['Numbers', 'Add number', 'Number'], HOME_MAX_ITEMS.stats, [
        text('value', 'Value', { required: true, maxLength: L.statValue, hint: 'e.g. 150+' }),
        text('label', 'Label', { required: true, maxLength: L.statLabel }),
      ]),
    ],
  },
  {
    id: 'proof-testimonials',
    title: 'Testimonials',
    path: ContentPath.HomeProof,
    anchor: PageAnchor.Proof,
    fields: [
      hideable(
        groupList(
          'testimonials',
          ['Testimonials', 'Add testimonial', 'Testimonial'],
          HOME_MAX_ITEMS.testimonials,
          [
            multiline('quote', 'Quote', { required: true, maxLength: L.quote }),
            text('name', 'Name', { required: true, maxLength: L.name }),
            text('detail', 'Role, company or occasion', { maxLength: L.detail }),
            text('initial', 'Letter in the circle', {
              maxLength: L.initial,
              hint: 'Usually the first letter of the name.',
            }),
          ],
        ),
      ),
    ],
  },
  {
    id: 'proof-clients',
    title: 'Clients',
    path: ContentPath.HomeProof,
    anchor: PageAnchor.Proof,
    fields: [
      text('trustedLabel', 'Heading above the clients', { maxLength: L.label }),
      groupList('clients', ['Clients', 'Add client', 'Client'], HOME_MAX_ITEMS.clients, [
        text('name', 'Name', { required: true, maxLength: L.clientName }),
      ]),
      multiline('clientsNote', 'Note below the clients', { maxLength: L.note }),
    ],
  },
];

/** The questions and answers (0028). */
export const FAQ_SECTION: IEditorSection = {
  id: 'faq',
  title: 'Questions and answers',
  path: ContentPath.HomeFaq,
  anchor: PageAnchor.Faq,
  fields: [
    eyebrow,
    title,
    hideable(
      groupList('items', ['Questions', 'Add question', 'Question'], HOME_MAX_ITEMS.faq, [
        text('question', 'Question', { required: true, maxLength: L.question }),
        multiline('answer', 'Answer', { required: true, maxLength: L.answer }),
        offSwitch('open', 'Open at first', 'Shows the answer without a click.'),
      ]),
    ),
  ],
};
