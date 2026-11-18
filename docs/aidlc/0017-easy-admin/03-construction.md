# 03 · Construction — An admin anyone can use (1.11.0)

| #   | Increment         | Main files                                                                                                                                                          | Tests                                                                                    |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | U1 Menu           | `editor-tab.enum.ts`, `editor-tabs.ts` (one tab per site section), `content.sections.ts` (cards split out), `editor-nav.constants.ts`, `admin.routes.ts` (redirect) | `editor-tabs.spec.ts`, `editor-layout.component.spec.ts`, `admin-find.e2e.ts` (redirect) |
| 2   | U4 Plain words    | publish bar and page, dashboard, `visibility.sections.ts`, `media.sections.ts`, `placeholder.ts`, speed report, photo library                                       | updated specs and e2e                                                                    |
| 3   | U2 Find           | `components/editor-find/*`, `models/find-index.ts`, `services/editor-jump.service.ts` (also used by preview clicks)                                                 | `find-index.spec.ts`, `editor-jump.service.spec.ts`, `admin-find.e2e.ts`                 |
| 4   | U3 To-do list     | `dashboard.component.*` (grouped by section, Fix links)                                                                                                             | `dashboard.component.spec.ts`, `admin-find.e2e.ts`                                       |
| 5   | U5 Quieter forms  | `schema-field.component.*` (counter from 80 %), `schema-fields.component.scss` (flat groups)                                                                        | `schema-field.component.spec.ts`                                                         |
| 6   | U6 Phones         | `editor-top-bar.*`, `editor-layout.*` (account in the drawer), `publish-bar.component.html` (slot), `editor-page.*` (preview switch in the bar)                     | `admin-sign-in.e2e.ts`, `firebase-smoke.e2e.ts`                                          |
| 7   | Walkthrough fixes | F1–F7 in the [design](02-design.md#second-walkthrough-after-u1u6)                                                                                                   | as above                                                                                 |

## Decisions & deviations from design

- **Heading cards are called "Section heading"** on every tab with more than one card (Videos, Team, Shows, Gallery,
  Experiences): with the old names, Videos had two cards called "Videos" and Team a "Team" card on the Team tab.
- **Review & publish names changes by tab and card** ("Team · Section heading"), so the new heading names stay clear there.
- **Review & publish sits under Dashboard** (F2), not in its own group at the bottom.
- **The folded panel's search icon is drawn in the admin**, not added to the shared icon set: that set ships with the public
  site, and adding it took the first download to 499.98 kB.
- **The preview switch moved into the publish bar** through a content slot (F5), instead of floating over the form.
- **Default tab for an unknown route is Hero** (was Offer), the first in the menu.

## Screenshots for approval

In [`screenshots/`](screenshots/): the dashboard and its grouped to-do list, Find, the Team tab (heading and members together),
Show or hide sections, and the phone's Hero tab and menu. The e2e screenshot baselines (dashboard; and the home sections from
1.10.0) are re-recorded only after the owner approves the look.

---

**Approval:** ☐ Pending
