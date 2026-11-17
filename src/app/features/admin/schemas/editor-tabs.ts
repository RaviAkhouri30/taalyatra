import { AppRoute } from '@shared/enums/app-route.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { CONTACT_SECTIONS } from './contact.sections';
import { CONTENT_SECTIONS } from './content.sections';
import {
  EXPERIENCES_SECTIONS,
  GALLERY_SECTIONS,
  SHOWS_SECTIONS,
  TEAM_SECTIONS,
  VIDEOS_SECTIONS,
} from './media.sections';
import { OFFER_SECTIONS } from './offer.sections';
import { VISIBILITY_SECTIONS } from './visibility.sections';
import { DRUM_CIRCLE_SECTIONS } from './drum-circle.sections';

/** One editor tab: its label and the sections it edits. */
export interface IEditorTabSchema {
  readonly tab: EditorTab;
  readonly label: string;
  /** One line under the page's title, saying what's edited here. */
  readonly description: string;
  readonly sections: readonly IEditorSection[];
}

/**
 * The editor's tabs in menu order. A later release adds a tab by adding an entry and its
 * sections; nothing else changes (ADR-0014).
 */
export const EDITOR_TABS: readonly IEditorTabSchema[] = [
  {
    tab: EditorTab.Offer,
    label: 'Offer & theme',
    description: 'The festival offer, its dates and what it says.',
    sections: OFFER_SECTIONS,
  },
  {
    tab: EditorTab.Content,
    label: 'Page content',
    description: 'Your business details, the hero and the main section headings.',
    sections: CONTENT_SECTIONS,
  },
  {
    tab: EditorTab.Experiences,
    label: 'Experiences',
    description: 'The experience cards on the home page, and which one is featured.',
    sections: EXPERIENCES_SECTIONS,
  },
  {
    tab: EditorTab.DrumCircle,
    label: 'Drum circle',
    description:
      'The drum circle section on the home page: its About text and picture, facts, objectives and session flow.',
    sections: DRUM_CIRCLE_SECTIONS,
  },
  {
    tab: EditorTab.Gallery,
    label: 'Gallery',
    description: 'The photos in the home page gallery, and their heading.',
    sections: GALLERY_SECTIONS,
  },
  {
    tab: EditorTab.Team,
    label: 'Team',
    description: 'The people on the Team page. The first four also appear on the home page.',
    sections: TEAM_SECTIONS,
  },
  {
    tab: EditorTab.Shows,
    label: 'Shows',
    description: 'Your show formats, their images and which one is featured.',
    sections: SHOWS_SECTIONS,
  },
  {
    tab: EditorTab.Videos,
    label: 'Videos',
    description: 'Your videos, in the order they appear. The first is featured.',
    sections: VIDEOS_SECTIONS,
  },
  {
    tab: EditorTab.Visibility,
    label: 'Sections & pages',
    description: 'Switch home sections, pages and site-wide widgets on or off.',
    sections: VISIBILITY_SECTIONS,
  },
  {
    tab: EditorTab.Contact,
    label: 'Contact & links',
    description: 'Your phone number, email, address and social links.',
    sections: CONTACT_SECTIONS,
  },
];

/** Every section in the editor, for checks that look across tabs. */
export const ALL_SECTIONS: readonly IEditorSection[] = EDITOR_TABS.flatMap((tab) => tab.sections);

const TABS_BY_ID: ReadonlyMap<EditorTab, IEditorTabSchema> = new Map(
  EDITOR_TABS.map((entry) => [entry.tab, entry]),
);

/** Where to go to fix something: a tab, and the card on it. */
export interface IIssueLink {
  readonly tabLabel: string;
  readonly url: string;
  /** The card's heading id, which the page scrolls to. */
  readonly fragment: string;
}

/**
 * @param sectionId An editor section's id.
 * @returns The tab and card that edit it, or `null` when no tab does.
 */
export function issueLink(sectionId: string): IIssueLink | null {
  const entry = EDITOR_TABS.find(({ sections }) => sections.some(({ id }) => id === sectionId));
  return entry
    ? {
        tabLabel: entry.label,
        url: `${AppRoute.Admin}/${entry.tab}`,
        fragment: `card-${sectionId}`,
      }
    : null;
}

/**
 * @param tab A tab, from the route.
 * @returns Its schema, or `undefined` for a tab the editor doesn't have.
 */
export function tabSchema(tab: EditorTab): IEditorTabSchema | undefined {
  return TABS_BY_ID.get(tab);
}

/** Settings cards: they edit site-wide values, not a section you can point at on the page. */
const SETTINGS_PATHS: ReadonlySet<string> = new Set([
  ContentPath.SiteConfig,
  ContentPath.SiteVisibility,
]);

/**
 * The card that edits the page section a preview click landed on (1.11.0): on the current tab if it
 * has one, else the first tab that does. Settings cards are skipped, so the hero opens Hero, not
 * the business details that share its anchor.
 *
 * @param anchor The section's element id in the site.
 * @param current The tab the owner is on.
 * @returns The tab and card, or `null` when no card edits that section.
 */
export function cardForAnchor(anchor: string, current?: EditorTab): IIssueLink | null {
  const editsIt = ({ sections }: IEditorTabSchema): IEditorSection | undefined =>
    sections.find(
      (section) => (section.anchor as string) === anchor && !SETTINGS_PATHS.has(section.path),
    );
  const here = current === undefined ? undefined : tabSchema(current);
  const entry = here && editsIt(here) ? here : EDITOR_TABS.find((tab) => editsIt(tab));
  const section = entry === undefined ? undefined : editsIt(entry);
  return entry && section ? issueLink(section.id) : null;
}

/** Each page section the preview lets the owner click, with the tab that edits it. */
export const PICKABLE_SECTIONS: ReadonlyMap<string, string> = new Map(
  [...new Set(ALL_SECTIONS.map((section) => section.anchor))].flatMap((anchor) => {
    const link = cardForAnchor(anchor);
    return link === null ? [] : [[anchor, link.tabLabel] as const];
  }),
);
