import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { multiline, text } from './schema-fields';

/** Link fields take a full web address; long Maps links fit. */
const URL_MAX = 500;

/** The contact & links tab: contact details, social profiles and the copyright year. */
export const CONTACT_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'contactDetails',
    title: 'Contact details',
    path: ContentPath.SiteConfig,
    anchor: PageAnchor.Contact,
    tip: 'These appear in the top bar, the planner, the footer and the chat assistant. The phone number is also used for every WhatsApp button.',
    fields: [
      {
        key: 'contact',
        label: 'Contact',
        kind: FieldKind.Group,
        fields: [
          {
            key: 'phone',
            label: 'Phone',
            kind: FieldKind.Group,
            fields: [
              text('display', 'Phone, as shown', {
                required: true,
                maxLength: CONTENT_MAX_LENGTH.phoneDisplay,
              }),
              {
                key: 'e164',
                label: 'Phone for calls and WhatsApp',
                kind: FieldKind.Tel,
                required: true,
                maxLength: CONTENT_MAX_LENGTH.phoneE164,
                hint: 'International format, for example +919284276168.',
              },
            ],
          },
          {
            key: 'email',
            label: 'Email',
            kind: FieldKind.Email,
            required: true,
            maxLength: CONTENT_MAX_LENGTH.email,
          },
          text('businessName', 'Name on the map', { maxLength: 80 }),
          text('locality', 'Area', { maxLength: 80 }),
          multiline('address', 'Address', {
            required: true,
            maxLength: CONTENT_MAX_LENGTH.address,
          }),
          text('hours', 'Opening hours', { maxLength: 60 }),
          text('plusCode', 'Plus code', { maxLength: 40 }),
          { key: 'mapsUrl', label: 'Google Maps link', kind: FieldKind.Url, maxLength: URL_MAX },
          {
            key: 'directionsUrl',
            label: 'Directions link',
            kind: FieldKind.Url,
            maxLength: URL_MAX,
          },
        ],
      },
      {
        key: 'socials',
        label: 'Social profiles',
        kind: FieldKind.List,
        addLabel: 'Add profile',
        maxItems: 6,
        item: {
          key: 'social',
          label: 'Profile',
          kind: FieldKind.Group,
          fields: [
            {
              key: 'platform',
              label: 'Platform',
              kind: FieldKind.Choice,
              options: [
                { value: SocialPlatform.Instagram, label: 'Instagram' },
                { value: SocialPlatform.YouTube, label: 'YouTube' },
                { value: SocialPlatform.Facebook, label: 'Facebook' },
              ],
            },
            text('label', 'Name', { required: true, maxLength: 40 }),
            { key: 'href', label: 'Link', kind: FieldKind.Url, required: true, maxLength: URL_MAX },
          ],
        },
      },
      {
        key: 'copyrightYear',
        label: 'Copyright year',
        kind: FieldKind.Number,
        min: 2020,
        max: 2100,
      },
    ],
  },
];
