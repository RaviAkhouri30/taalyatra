import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { FestiveTheme } from '@shared/enums/festive-theme.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { HEADING_FIELDS, buttonLabel, multiline, text } from './schema-fields';

/** The offer tab: the badge's switch, dates and text, then the home page's offer section. */
export const OFFER_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'promotion',
    title: 'Offer switch and dates',
    path: ContentPath.SiteConfig,
    anchor: PageAnchor.Diwali,
    tip: 'The offer hides itself outside these dates, in Pune time. Leave a date empty for no limit.',
    fields: [
      {
        key: 'promotion',
        label: 'Offer badge',
        kind: FieldKind.Group,
        fields: [
          {
            key: 'live',
            label: 'Offer is live',
            kind: FieldKind.Toggle,
            hint: 'Shows the badge and the offer section.',
          },
          { key: 'startsOn', label: 'Live from', kind: FieldKind.Date },
          { key: 'endsOn', label: 'Ends on', kind: FieldKind.Date },
          text('label', 'Badge text', {
            required: true,
            maxLength: CONTENT_MAX_LENGTH.promotionLabel,
            recommended: 20,
          }),
          text('subtitle', 'Badge subtitle', { maxLength: 80 }),
          text('dismissLabel', 'Close button name, read by screen readers', {
            required: true,
            maxLength: 80,
          }),
        ],
      },
    ],
  },
  {
    id: 'offer',
    title: 'Offer section',
    path: ContentPath.HomeOffer,
    anchor: PageAnchor.Diwali,
    tip: 'Keep the title under 40 characters so it stays on two lines.',
    fields: [
      {
        key: 'theme',
        label: 'Festive animation',
        kind: FieldKind.Choice,
        options: [
          { value: FestiveTheme.Sparks, label: 'Diwali sparks' },
          { value: FestiveTheme.None, label: 'No animation' },
        ],
      },
      HEADING_FIELDS.eyebrow,
      { ...HEADING_FIELDS.title, recommended: 40 },
      HEADING_FIELDS.lead,
      {
        key: 'cards',
        label: 'Offer cards',
        kind: FieldKind.List,
        addLabel: 'Add offer card',
        maxItems: 6,
        item: {
          key: 'card',
          label: 'Offer card',
          kind: FieldKind.Group,
          fields: [
            text('title', 'Card title', { required: true, maxLength: 80 }),
            multiline('text', 'Description', { maxLength: 300 }),
            text('note', 'Duration and price', { maxLength: 120 }),
          ],
        },
      },
      buttonLabel('primaryCta', 'Main button'),
      buttonLabel('whatsAppCta', 'WhatsApp button'),
      multiline('footnote', 'Small print', { maxLength: 300 }),
    ],
  },
];
