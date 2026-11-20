import { AppRoute } from '@shared/enums/app-route.enum';
import { type IconName } from '@shared/enums/icon-name.enum';
import { FEATURES, FeatureGroup, type IFeature } from './features.constants';
import { type Permissions } from './permissions.model';

/** One feature as the account sees it on the Features page (0020 V18). */
export interface IFeatureCard {
  readonly id: string;
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
  /** Where to see it on the site, or `null`. */
  readonly site: string | null;
  /** The admin page that changes it, or `null` when the account can't open one. */
  readonly changeUrl: string | null;
  /** Said instead of a link: where it's used, or that the owner manages it. */
  readonly note: string;
}

/** One group of cards. */
export interface IFeatureGroup {
  readonly label: FeatureGroup;
  readonly cards: readonly IFeatureCard[];
}

/** What a manager reads for a page they can't open. */
export const MANAGED_BY_OWNER = 'Managed by the owner';

function card(feature: IFeature, permissions: Permissions): IFeatureCard {
  const { change } = feature;
  const base = {
    id: feature.id,
    icon: feature.icon,
    title: feature.title,
    description: feature.description,
    site: feature.site ?? null,
  };
  if ('note' in change) {
    return { ...base, changeUrl: null, note: change.note };
  }
  if ('tab' in change && !permissions.canSee(change.tab)) {
    return { ...base, changeUrl: null, note: MANAGED_BY_OWNER };
  }
  const path = 'tab' in change ? change.tab : change.page;
  return { ...base, changeUrl: `${AppRoute.Admin}/${path}`, note: '' };
}

/**
 * @param permissions The signed-in account.
 * @param features The features to show (every one by default).
 * @returns Them by group, in order: a manager doesn't see the owner's own areas, and sees
 *   "Managed by the owner" for a page hidden from them.
 */
export function featureGroups(
  permissions: Permissions,
  features: readonly IFeature[] = FEATURES,
): IFeatureGroup[] {
  const shown = features.filter((feature) => permissions.isOwner || feature.ownerOnly !== true);
  return Object.values(FeatureGroup).flatMap((label) => {
    const cards = shown
      .filter((feature) => feature.group === label)
      .map((feature) => card(feature, permissions));
    return cards.length > 0 ? [{ label, cards }] : [];
  });
}
