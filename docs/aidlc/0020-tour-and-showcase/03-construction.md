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

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20.

## 2.1.1 · Easier admin pass (V6)

The walkthrough (D4) was done by screenshots of every admin page at desktop and phone width, on the fake backend. The owner
chose all four fixes found (2026-11-20); the dashboard's "Still to fill in" wording was checked and kept.

| #   | Fix                    | Files                                                                                                                                                                                             | Tests                                                                                       |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 5   | Plainer words          | `models/publish-page.model.ts` (`PUBLISH_INTRO`, for the owner and for a manager), `view-models/publish-page.view-model.ts`, `publish-page/*`; `models/review.model.ts`: "Publish 2 changes?"     | `publish-page.view-model.spec.ts`, `review.model.spec.ts`, `publish-page.component.spec.ts` |
| 6   | Empty lists explain    | `schema-fields/*`: "None yet. Press “+ Add …” to add one; it shows on the website once published."                                                                                                | `schema-fields.component.spec.ts`                                                           |
| 7   | Consistent page layout | `src/styles/_admin.scss` (`page` mixin), `$admin-page-padding` tokens, used by all nine admin pages; `editor-page/*`: a card heading that only repeats the page's is kept for screen readers only | `editor-page.view-model.spec.ts`, `editor-page.component.spec.ts`; screenshots              |
| 8   | Phone bars, one row    | `publish-bar.component.scss`, `editor-page.component.scss` (Show preview), `editor-top-bar.component.scss`, `help-menu.component.scss`                                                            | screenshots at 390 and 360 px wide                                                          |

### Decisions

- **Review & publish's intro differs by role:** the owner's mentions approvals and backups, which a manager doesn't have.
- **The repeated heading stays in the page** (visually hidden), because it names its card for screen readers and the
  preview follows it; three pages had one (Hero, Who it's for, Rhythm game).
- **The phone bars are shrunk where they are**, not through the shared `Compact` button size, so no other button moves.
- **Found on the way:** on 360-pixel phones (many Android phones) the top bar wrapped View site onto a second line since
  2.1.0 added Help, and the publish bar wrapped Publish. Both now fit one row.
- **One screenshot baseline changed:** the dashboard on phones (its spacing and the one-row publish bar), re-recorded after
  the owner chose these fixes. Desktop and tablet already used this spacing.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20.
