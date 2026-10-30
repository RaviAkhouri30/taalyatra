import { AppRoute } from '@shared/enums/app-route.enum';
import { HomeSection } from '@shared/enums/home-section.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SitePage } from '@shared/enums/site-page.enum';

/**
 * The home section each anchor lands on, so links to a hidden section can be dropped. Anchors
 * without an entry (top, offer, contact) are never hidden by a section switch.
 */
export const ANCHOR_SECTIONS: ReadonlyMap<PageAnchor, HomeSection> = new Map([
  [PageAnchor.ForEveryone, HomeSection.Audiences],
  [PageAnchor.Experiences, HomeSection.Experiences],
  [PageAnchor.Shows, HomeSection.Shows],
  [PageAnchor.DrumCircleDetails, HomeSection.DrumCircle],
  [PageAnchor.Play, HomeSection.RhythmGame],
  [PageAnchor.Watch, HomeSection.Videos],
  [PageAnchor.Gallery, HomeSection.Gallery],
  [PageAnchor.Philosophy, HomeSection.Philosophy],
  [PageAnchor.How, HomeSection.How],
  [PageAnchor.Team, HomeSection.Team],
  [PageAnchor.Insta, HomeSection.Instagram],
  [PageAnchor.Proof, HomeSection.Proof],
  [PageAnchor.Faq, HomeSection.Faq],
]);

/** The inner page each route shows, so links to a switched-off page can be dropped. */
export const ROUTE_PAGES: ReadonlyMap<AppRoute, SitePage> = new Map([
  [AppRoute.Videos, SitePage.Videos],
  [AppRoute.Team, SitePage.Team],
  [AppRoute.Shows, SitePage.Shows],
  [AppRoute.Achievements, SitePage.Achievements],
]);
