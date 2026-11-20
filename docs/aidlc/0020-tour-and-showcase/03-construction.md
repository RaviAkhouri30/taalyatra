# 03 · Construction — Guided tour, features showcase and an easier admin (2.1.0)

| #   | Increment     | Files                                                                                                                                                                                                                                                                      | Tests                                                                                                                                |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Tour engine   | `models/tour.model.ts`, `tour.constants.ts`, `tour-placement.ts`, `services/tour.service.ts`, `directives/tour-target.directive.ts`, `placed.directive.ts`, `components/tour/*`, `tour-offer/*`; targets in the editor layout and page; `$z-tour`, `$color-overlay` tokens | their specs; `e2e/specs/admin-tour.e2e.ts` (the offer once, the owner's tour by keyboard with every area framed, Escape, axe)        |
| 2   | Help menu     | `components/help-menu/*`, in the top bar on every size                                                                                                                                                                                                                     | `help-menu.component.spec.ts`; `admin-tour.e2e.ts`                                                                                   |
| 3   | Features page | `models/features.constants.ts`, `features-page.model.ts`, `view-models/features-page.view-model.ts`, `components/features-page/*`, route and menu link                                                                                                                     | their specs (every link checked against the editor pages and site sections); `admin-tour.e2e.ts`, `admin-approvals.e2e.ts` (manager) |
| 4   | Test support  | `e2e/fixtures/test.ts`: a `tourOffered` option, off by default, answers the offer for the test accounts so it never covers the page                                                                                                                                        | every e2e spec                                                                                                                       |

The easier-admin fixes (V6) follow as 2.1.1, after the owner's walkthrough notes.

## Decisions & deviations from design

- **A manager's tour has 8 steps, not 7:** the design's count left out one of the shared steps. Only "Only yours" is the
  owner's.
- **Help sits in the top bar on every size**, not in the drawer on phones: the top bar keeps View site on phones, so Help fits
  beside it, stays one tap away and gives the tour one place to point at.
- **A step's card stays on screen:** under the area when there's room, else above it, else at the foot of the screen (the
  cards on an editor page are taller than a tablet's screen). Found by the manager's tour on tablets.
- **A step whose area isn't on screen shows its card on its own** instead of being skipped (the preview on phones and
  tablets, which show the form or the preview): the step still says where to find it.
- **Starting the tour from Help moves focus to Help first**, so closing the tour gives focus back to a button that still
  exists.
- **The overlay and the drawer's backdrop share a new `$color-overlay` token**; the backdrop's colour was hard-coded before.
- **Icons are reused** from the shared set (which ships with the public site): Features uses the check mark.
- **V22 recorded** in the programme (2026-11-20): the owner may give chosen managers backups, leads, visits, history and going
  back; later, with its own design, as it changes the rules.

---

**Approval:** ☐ Approved by \_\_\_\_ on \_\_\_\_
