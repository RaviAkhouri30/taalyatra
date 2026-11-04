import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { tabSchema } from '../schemas/editor-tabs';
import { EditorTab } from './editor-tab.enum';
import { SaveStatus } from './save-status.enum';

/** The route data key that tells an editor page which tab it shows. */
export const EDITOR_TAB_ROUTE_KEY = 'editorTab';

/** The publish page's path under `/admin`. */
export const PUBLISH_PATH = 'publish';

/** The media library's path under `/admin`. */
export const MEDIA_PATH = 'media';

/** One link in the editor's side panel. */
export interface IEditorNavLink {
  readonly label: string;
  readonly url: string;
  readonly icon: IconName;
  /** Only the dashboard needs an exact match: every editor URL starts with `/admin`. */
  readonly exact: boolean;
  /** Shows how many documents have unpublished changes. */
  readonly showsCount: boolean;
}

/** A group of links in the side panel. */
export interface IEditorNavGroup {
  /** Its small heading; the top group has none. */
  readonly label: string;
  readonly links: readonly IEditorNavLink[];
}

function pageLink(label: string, path: string, icon: IconName): IEditorNavLink {
  return { label, url: `${AppRoute.Admin}/${path}`, icon, exact: false, showsCount: false };
}

function tabLink(tab: EditorTab, icon: IconName): IEditorNavLink {
  return pageLink(tabSchema(tab)?.label ?? tab, tab, icon);
}

/** The editor's side panel, in order. */
export const EDITOR_NAV_GROUPS: readonly IEditorNavGroup[] = [
  {
    label: '',
    links: [
      {
        label: 'Dashboard',
        url: AppRoute.Admin,
        icon: IconName.Home,
        exact: true,
        showsCount: false,
      },
    ],
  },
  {
    label: 'Content',
    links: [
      tabLink(EditorTab.Content, IconName.Document),
      tabLink(EditorTab.Offer, IconName.Sparkle),
      tabLink(EditorTab.Experiences, IconName.Djembe),
      tabLink(EditorTab.Gallery, IconName.Image),
      tabLink(EditorTab.Team, IconName.Group),
      tabLink(EditorTab.Shows, IconName.Mic),
      tabLink(EditorTab.Videos, IconName.Video),
      tabLink(EditorTab.Contact, IconName.Phone),
    ],
  },
  {
    label: 'Site',
    links: [
      tabLink(EditorTab.Visibility, IconName.Toggle),
      pageLink('Media library', MEDIA_PATH, IconName.Folder),
    ],
  },
  {
    label: 'Publish',
    links: [{ ...pageLink('Review & publish', PUBLISH_PATH, IconName.Send), showsCount: true }],
  },
];

/** What the status line says for each autosave state. */
export const SAVE_STATUS_TEXT: Readonly<Record<SaveStatus, string>> = {
  [SaveStatus.Idle]: 'Changes save automatically as a draft.',
  [SaveStatus.Saving]: 'Saving…',
  [SaveStatus.Saved]: 'Saved in your draft. Visitors still see the published site.',
  [SaveStatus.Failed]: 'Couldn’t save your last change.',
};

/** How long the editor waits after the last keystroke before saving (0008 D3). */
export const AUTOSAVE_DEBOUNCE_MS = 800;
