import { HomeSection } from '@shared/enums/home-section.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type IToggleFieldSchema } from '../models/i-field-schema';

/** The owner-facing name of each home section, in page order. */
const SECTION_LABELS: readonly (readonly [HomeSection, string])[] = [
  [HomeSection.Marquee, 'Scrolling words under the hero'],
  [HomeSection.Trust, 'Trust strip'],
  [HomeSection.Audiences, 'Who it’s for'],
  [HomeSection.Experiences, 'Experiences'],
  [HomeSection.Shows, 'Shows'],
  [HomeSection.DrumCircle, 'Drum circle details'],
  [HomeSection.RhythmGame, 'Rhythm game'],
  [HomeSection.Videos, 'Videos'],
  [HomeSection.Gallery, 'Gallery'],
  [HomeSection.Philosophy, 'Our story'],
  [HomeSection.MidCta, 'Mid-page call to action'],
  [HomeSection.Cities, 'Cities'],
  [HomeSection.How, 'How it works'],
  [HomeSection.Team, 'Team'],
  [HomeSection.Instagram, 'Instagram'],
  [HomeSection.Proof, 'Testimonials and clients'],
  [HomeSection.Faq, 'FAQ'],
];

const PAGE_LABELS: readonly (readonly [SitePage, string])[] = [
  [SitePage.Videos, 'Videos page'],
  [SitePage.Team, 'Team page'],
  [SitePage.Shows, 'Shows page'],
  [SitePage.Achievements, 'Achievements page'],
];

const WIDGET_LABELS: readonly (readonly [SiteWidget, string, string])[] = [
  [SiteWidget.Intro, 'Intro animation', 'Plays once per visit when the home page opens.'],
  [SiteWidget.Assistant, 'Chat assistant', 'The chat, call and WhatsApp buttons on the home page.'],
  [SiteWidget.UtilityBar, 'Top bar', 'Phone, email and social links above the menu.'],
  [SiteWidget.ActionBar, 'Phone action bar', 'Call, WhatsApp and proposal buttons on phones.'],
  [SiteWidget.WhatsApp, 'Floating WhatsApp button', 'On the inner pages.'],
];

function toggle(key: string, label: string, hint?: string): IToggleFieldSchema {
  return hint === undefined
    ? { key, label, kind: FieldKind.Toggle }
    : { key, label, kind: FieldKind.Toggle, hint };
}

/** The sections & pages tab: one switch per home section, inner page and site-wide element. */
export const VISIBILITY_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'visibility',
    title: 'Sections and pages',
    path: ContentPath.SiteVisibility,
    anchor: PageAnchor.Top,
    tip: 'A hidden section disappears with its menu links, and loads nothing. The hero and the proposal form are always on: every “Request proposal” button leads to them. The offer follows its own switch and dates.',
    fields: [
      {
        key: 'sections',
        label: 'Home page sections',
        kind: FieldKind.Group,
        fields: SECTION_LABELS.map(([key, label]) => toggle(key, label)),
      },
      {
        key: 'pages',
        label: 'Pages',
        kind: FieldKind.Group,
        fields: PAGE_LABELS.map(([key, label]) => toggle(key, label)),
      },
      {
        key: 'widgets',
        label: 'Site-wide',
        kind: FieldKind.Group,
        fields: WIDGET_LABELS.map(([key, label, hint]) => toggle(key, label, hint)),
      },
    ],
  },
];
