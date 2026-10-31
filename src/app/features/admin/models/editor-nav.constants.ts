import { AppRoute } from '@shared/enums/app-route.enum';
import { EDITOR_TABS } from '../schemas/editor-tabs';
import { SaveStatus } from './save-status.enum';

/** The route data key that tells an editor page which tab it shows. */
export const EDITOR_TAB_ROUTE_KEY = 'editorTab';

/** The publish page's path under `/admin`. */
export const PUBLISH_PATH = 'publish';

/** One link in the editor's tab bar. */
export interface IEditorNavLink {
  readonly label: string;
  readonly url: string;
  /** Only the dashboard needs an exact match: every editor URL starts with `/admin`. */
  readonly exact: boolean;
}

/** The editor's tab bar: dashboard, the edit tabs, then review & publish. */
export const EDITOR_NAV: readonly IEditorNavLink[] = [
  { label: 'Dashboard', url: AppRoute.Admin, exact: true },
  ...EDITOR_TABS.map((entry) => ({
    label: entry.label,
    url: `${AppRoute.Admin}/${entry.tab}`,
    exact: false,
  })),
  { label: 'Review & publish', url: `${AppRoute.Admin}/${PUBLISH_PATH}`, exact: false },
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
