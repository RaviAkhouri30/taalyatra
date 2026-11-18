import { AppRoute } from '@shared/enums/app-route.enum';

/**
 * The public pages whose visits are counted and speed measured (0012, 0018). `firestore.rules`
 * lists the same paths; anything else isn't reported.
 */
export const VISIT_PAGES: readonly string[] = [
  AppRoute.Home,
  AppRoute.Shows,
  AppRoute.Videos,
  AppRoute.Team,
  AppRoute.Achievements,
];

/** The kinds of device a visit is put under, as `firestore.rules` accepts them. */
export const VISIT_DEVICES = ['phone', 'tablet', 'desktop'] as const;

/** A kind of device a visit is put under. */
export type VisitDevice = (typeof VISIT_DEVICES)[number];

/**
 * Set in a browser once the admin area has been opened in it, so the owner's own visits to the
 * site aren't counted (0018 decision 3). A plain marker, never an id.
 */
export const ADMIN_DEVICE_KEY = 'taal-yatra.admin.device';
