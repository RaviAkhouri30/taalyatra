import { type IconName } from '@shared/enums/icon-name.enum';
import { type EditorTab } from './editor-tab.enum';
import { type ManagerArea } from './manager-area.enum';

/** The Features page's groups, in order (0020 V18). */
export enum FeatureGroup {
  HomePage = 'Home page',
  EveryPage = 'Every page',
  Admin = 'Admin',
}

/** Where a feature is changed: an editor page the account may have hidden, or another admin page. */
export type FeatureChange =
  { readonly tab: EditorTab } | { readonly page: string } | { readonly note: string };

/** One feature of the website or the admin, as the Features page lists it. */
export interface IFeature {
  readonly id: string;
  readonly group: FeatureGroup;
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
  /** Where to see it on the site, e.g. `/#diwali`; none for admin features. */
  readonly site?: string;
  readonly change: FeatureChange;
  /** One of the owner's own areas (0019 decision 6): not listed for a manager. */
  readonly ownerOnly?: boolean;
  /** An area the owner can give a manager (0022): listed for a manager given it. */
  readonly area?: ManagerArea;
  /** AI help (0025): listed only once the provider is set up. */
  readonly ai?: boolean;
}
