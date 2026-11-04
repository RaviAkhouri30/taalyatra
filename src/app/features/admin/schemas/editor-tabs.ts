import { AppRoute } from '@shared/enums/app-route.enum';
import { type IEditorSection } from '../models/i-editor-section';
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

/** One editor tab: its label and the sections it edits. */
export interface IEditorTabSchema {
  readonly tab: EditorTab;
  readonly label: string;
  readonly sections: readonly IEditorSection[];
}

/**
 * The editor's tabs in menu order. A later release adds a tab by adding an entry and its
 * sections; nothing else changes (ADR-0014).
 */
export const EDITOR_TABS: readonly IEditorTabSchema[] = [
  { tab: EditorTab.Offer, label: 'Offer & theme', sections: OFFER_SECTIONS },
  { tab: EditorTab.Content, label: 'Page content', sections: CONTENT_SECTIONS },
  { tab: EditorTab.Experiences, label: 'Experiences', sections: EXPERIENCES_SECTIONS },
  { tab: EditorTab.Gallery, label: 'Gallery', sections: GALLERY_SECTIONS },
  { tab: EditorTab.Team, label: 'Team', sections: TEAM_SECTIONS },
  { tab: EditorTab.Shows, label: 'Shows', sections: SHOWS_SECTIONS },
  { tab: EditorTab.Videos, label: 'Videos', sections: VIDEOS_SECTIONS },
  { tab: EditorTab.Visibility, label: 'Sections & pages', sections: VISIBILITY_SECTIONS },
  { tab: EditorTab.Contact, label: 'Contact & links', sections: CONTACT_SECTIONS },
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
