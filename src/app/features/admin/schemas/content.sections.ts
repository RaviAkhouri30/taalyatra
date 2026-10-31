import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { HEADING_FIELDS, buttonLabel, multiline, text } from './schema-fields';

const { eyebrow, title, lead } = HEADING_FIELDS;

/**
 * @param id The section id.
 * @param heading The card's heading.
 * @param path The home document.
 * @param anchor Where the preview scrolls.
 * @returns A card editing a home section's eyebrow, title and introduction.
 */
function headings(
  id: string,
  heading: string,
  path: ContentPath,
  anchor: PageAnchor,
): IEditorSection {
  return { id, title: heading, path, anchor, fields: [eyebrow, title, lead] };
}

/** The page content tab: site details, the hero and the main section headings. */
export const CONTENT_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'brand',
    title: 'Site details',
    path: ContentPath.SiteConfig,
    anchor: PageAnchor.Top,
    fields: [
      {
        key: 'brand',
        label: 'Brand',
        kind: FieldKind.Group,
        fields: [
          text('name', 'Business name', {
            required: true,
            maxLength: CONTENT_MAX_LENGTH.brandName,
          }),
          text('tagline', 'Tagline under the logo', { maxLength: CONTENT_MAX_LENGTH.tagline }),
          multiline('description', 'One-line description', {
            maxLength: 200,
            hint: 'Search engines show it, and so do link previews.',
          }),
        ],
      },
    ],
  },
  {
    id: 'hero',
    title: 'Hero',
    path: ContentPath.HomeHero,
    anchor: PageAnchor.Top,
    tip: 'Keep the headline under 40 characters so it stays on two lines.',
    fields: [
      eyebrow,
      { ...title, label: 'Headline, first line', recommended: 40 },
      text('highlight', 'Headline, highlighted line', {
        maxLength: CONTENT_MAX_LENGTH.highlight,
        recommended: 25,
      }),
      lead,
      buttonLabel('primaryCta', 'Main button'),
      buttonLabel('whatsAppCta', 'WhatsApp button'),
      text('callCtaPrefix', 'Word before the phone number on the call button', {
        required: true,
        maxLength: 20,
      }),
      {
        key: 'audiences',
        label: 'Audience tags',
        kind: FieldKind.List,
        addLabel: 'Add audience',
        maxItems: 6,
        item: text('audience', 'Audience', { required: true, maxLength: 40 }),
      },
      buttonLabel('gameCta', 'Rhythm game link'),
    ],
  },
  headings('audiences', 'Who it’s for', ContentPath.HomeAudiences, PageAnchor.ForEveryone),
  headings('experiences', 'Experiences', ContentPath.HomeExperiences, PageAnchor.Experiences),
  headings('rhythmGame', 'Rhythm game', ContentPath.HomeRhythmGame, PageAnchor.Play),
  {
    ...headings('videos', 'Videos', ContentPath.HomeVideos, PageAnchor.Watch),
    fields: [eyebrow, title, buttonLabel('cta', 'Link to the Videos page')],
  },
  {
    ...headings('team', 'Team', ContentPath.HomeTeam, PageAnchor.Team),
    fields: [eyebrow, title, lead, buttonLabel('cta', 'Link to the Team page')],
  },
  headings('contact', 'Plan your session', ContentPath.HomeContact, PageAnchor.Contact),
];
