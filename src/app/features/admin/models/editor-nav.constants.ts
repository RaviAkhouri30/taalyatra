import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { tabSchema } from '../schemas/editor-tabs';
import { EditorTab } from './editor-tab.enum';
import { type Permissions } from './permissions.model';
import { SaveStatus } from './save-status.enum';

/** The route data key that tells an editor page which tab it shows. */
export const EDITOR_TAB_ROUTE_KEY = 'editorTab';

/**
 * @param data A route's data.
 * @returns The editor tab it names; Hero when it names none.
 */
export function routeTab(data: Readonly<Record<string, unknown>>): EditorTab {
  const value = new Map(Object.entries(data)).get(EDITOR_TAB_ROUTE_KEY);
  return Object.values(EditorTab).find((tab) => tab === value) ?? EditorTab.Hero;
}

/** The publish page's path under `/admin`. */
export const PUBLISH_PATH = 'publish';

/** The media library's path under `/admin`. */
export const MEDIA_PATH = 'media';

/** What's new's path under `/admin` (0016 V1). */
export const RELEASES_PATH = 'releases';

/** The Visits page's path under `/admin` (0018 V11). */
export const VISITS_PATH = 'visits';

/** The Leads page's path under `/admin` (0018 V12). */
export const LEADS_PATH = 'leads';

/** What's new's name in the menu and its title. */
export const RELEASES_LABEL = 'What’s new';

/** The media library's name in the menu and its title (0017 U4: plain words). */
export const MEDIA_LABEL = 'Photo library';

/** The Visits page's name in the menu and its title. */
export const VISITS_LABEL = 'Visits';

/** The Leads page's name in the menu and its title. */
export const LEADS_LABEL = 'Leads';

/** The marker a menu link can carry. */
export enum NavBadge {
  None = 'none',
  /** How many documents have unpublished changes. */
  Changes = 'changes',
  /** "New" until the owner has seen the current release's notes (0016 V1). */
  News = 'news',
  /** How many leads are still new (0018 V12). */
  NewLeads = 'new-leads',
}

/** One link in the editor's side panel. */
export interface IEditorNavLink {
  readonly label: string;
  readonly url: string;
  readonly icon: IconName;
  /** Only the dashboard needs an exact match: every editor URL starts with `/admin`. */
  readonly exact: boolean;
  /** The marker beside it, if any. */
  readonly badge: NavBadge;
  /** The editor page it opens, which a manager may have hidden (0019); `null` for other pages. */
  readonly tab: EditorTab | null;
  /** Only the owner sees it (0019 decision 6). */
  readonly ownerOnly: boolean;
}

/** A group of links in the side panel. */
export interface IEditorNavGroup {
  /** Its small heading; the top group has none. */
  readonly label: string;
  readonly links: readonly IEditorNavLink[];
}

function pageLink(label: string, path: string, icon: IconName): IEditorNavLink {
  return {
    label,
    url: `${AppRoute.Admin}/${path}`,
    icon,
    exact: false,
    badge: NavBadge.None,
    tab: null,
    ownerOnly: false,
  };
}

function ownerLink(label: string, path: string, icon: IconName): IEditorNavLink {
  return { ...pageLink(label, path, icon), ownerOnly: true };
}

function tabLink(tab: EditorTab, icon: IconName): IEditorNavLink {
  return { ...pageLink(tabSchema(tab)?.label ?? tab, tab, icon), tab };
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
        badge: NavBadge.None,
        tab: null,
        ownerOnly: false,
      },
      // Right under Dashboard, so it's never below the fold of a long menu (0017 walkthrough).
      { ...pageLink('Review & publish', PUBLISH_PATH, IconName.Send), badge: NavBadge.Changes },
    ],
  },
  {
    // In the order the sections appear on the home page (0017 U1).
    label: 'Home page',
    links: [
      tabLink(EditorTab.Hero, IconName.Monitor),
      tabLink(EditorTab.Offer, IconName.Sparkle),
      tabLink(EditorTab.Audiences, IconName.Building),
      tabLink(EditorTab.Experiences, IconName.Star),
      tabLink(EditorTab.Shows, IconName.Mic),
      tabLink(EditorTab.DrumCircle, IconName.Djembe),
      tabLink(EditorTab.RhythmGame, IconName.Pulse),
      tabLink(EditorTab.Videos, IconName.Video),
      tabLink(EditorTab.Gallery, IconName.Image),
      tabLink(EditorTab.Team, IconName.Group),
      tabLink(EditorTab.ProposalForm, IconName.Mail),
    ],
  },
  {
    label: 'Settings',
    links: [
      tabLink(EditorTab.Business, IconName.Document),
      tabLink(EditorTab.Contact, IconName.Phone),
      tabLink(EditorTab.Visibility, IconName.Toggle),
      pageLink(MEDIA_LABEL, MEDIA_PATH, IconName.Folder),
    ],
  },
  {
    // Who comes to the site and who asks for a proposal (0018). "Visitors", not "Business":
    // Settings already has "Business details".
    label: 'Visitors',
    links: [
      ownerLink(VISITS_LABEL, VISITS_PATH, IconName.ArrowUpRight),
      { ...ownerLink(LEADS_LABEL, LEADS_PATH, IconName.Briefcase), badge: NavBadge.NewLeads },
    ],
  },
  {
    // At the bottom: news about the editor, not part of editing (0016 V1).
    label: '',
    links: [{ ...pageLink(RELEASES_LABEL, RELEASES_PATH, IconName.Clock), badge: NavBadge.News }],
  },
];

/**
 * @param permissions What the signed-in account may do.
 * @returns The side panel it sees: no hidden pages, no owner's pages for a manager, no empty group.
 */
export function navGroupsFor(permissions: Permissions): readonly IEditorNavGroup[] {
  return EDITOR_NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter(
      (link) =>
        (permissions.isOwner || !link.ownerOnly) &&
        (link.tab === null || permissions.canSee(link.tab)),
    ),
  })).filter((group) => group.links.length > 0);
}

/** What the status line says for each autosave state. */
export const SAVE_STATUS_TEXT: Readonly<Record<SaveStatus, string>> = {
  [SaveStatus.Idle]: 'Changes save automatically as a draft.',
  [SaveStatus.Saving]: 'Saving…',
  [SaveStatus.Saved]: 'Saved in your draft. Visitors still see the published site.',
  [SaveStatus.Failed]: 'Couldn’t save your last change.',
};

/** How long the editor waits after the last keystroke before saving (0008 D3). */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * The line that counts as "being read": a thin band 30 % down the screen. Cards don't overlap,
 * so only one can touch it at a time; a taller band could hold the end of one card and the start
 * of the next, and whichever reported last would win.
 */
export const READING_BAND = '-30% 0px -69% 0px';

/** How long the editor waits for scrolling to pause before the preview follows. */
export const PREVIEW_FOLLOW_DEBOUNCE_MS = 250;

/** The preview's fade out before it jumps to a section, and its fade back in. */
export const PREVIEW_FADE_OUT_MS = 150;
export const PREVIEW_FADE_IN_MS = 250;

/** How long the preview keeps a section in place while the site's content arrives. */
export const PREVIEW_SETTLE_MS = 4000;
