import { type IEditorSection } from '../models/i-editor-section';
import { EditorTab } from '../models/editor-tab.enum';
import { CONTACT_SECTIONS } from './contact.sections';
import { CONTENT_SECTIONS } from './content.sections';
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
  { tab: EditorTab.Visibility, label: 'Sections & pages', sections: VISIBILITY_SECTIONS },
  { tab: EditorTab.Contact, label: 'Contact & links', sections: CONTACT_SECTIONS },
];

/** Every section in the editor, for checks that look across tabs. */
export const ALL_SECTIONS: readonly IEditorSection[] = EDITOR_TABS.flatMap((tab) => tab.sections);

const TABS_BY_ID: ReadonlyMap<EditorTab, IEditorTabSchema> = new Map(
  EDITOR_TABS.map((entry) => [entry.tab, entry]),
);

/**
 * @param tab A tab, from the route.
 * @returns Its schema, or `undefined` for a tab the editor doesn't have.
 */
export function tabSchema(tab: EditorTab): IEditorTabSchema | undefined {
  return TABS_BY_ID.get(tab);
}
