# 03 · Construction — Editor foundation (1.6.0)

Built from the approved [design](02-design.md) on `feat/admin-editor`.

| #   | Increment | Files | Tests |
| --- | --------- | ----- | ----- |
| 1   | Admin write rules (D13, D14) | `firestore.rules` (`isAdmin()` by UID; shapes for `site/config`, `site/visibility` and the eight 1.6.0 home documents; `drafts` and `publishes` admin-only); `HomeSection`, `SitePage`, `SiteWidget`; `CONTENT_MAX_LENGTH`, `EDITABLE_HOME_SECTIONS`; the emulator admin uses the production UID | rules (32 new) |
| 2   | Visibility on the site (D10, D11) | `ISiteVisibilityDto`, `SiteVisibility`, `SiteVisibilityService` (always emits; missing = all on); `visibleLink`, `applyVisibility`; `pageEnabledGuard` (`canMatch`); home page view model gating every optional section and widget; shell widgets; "See all" links on the videos, team and shows teasers and the proof section; `site/visibility` in `fake-db.json` | unit, e2e |
| 3   | Promotion schedule (D12) | `CLOCK` token; `PromotionSchedule` and `PromotionStatus`; `IPromotionDto` gains `live`, `startsOn`, `endsOn`; `SiteConfigModel` treats a promotion outside its schedule as none, so the badge, offer section and Diwali links follow | unit |

## Checks so far

- **Auth token proof (risk in the design):** a script against the emulator, in the app's order
  (Firestore Lite first, Auth loaded later): the admin's write is allowed, signed-out and
  other-account writes are refused. No change to the gateways is needed.
- **Increment 3:** `npm run verify` passes, with 572 tests, statements at 99.75 % and branches at
  98.75 %. The initial bundle is 483.53 kB raw and 112.22 kB transferred. Rules tests: 69 passed.
- **Increment 2:** `npm run e2e`: 228 passed.

## Decisions & deviations from design

- **`site/layout` is named `site/visibility`** (with `SiteVisibility` and
  `SiteVisibilityService`). The shell state already has a `layout` (`PageLayout`, which chrome a
  page uses), and two different "layouts" side by side were confusing.
- **Anchor scrolling is unchanged (D11).** A link to a hidden section already stays at the top:
  `AnchorScrollService` gives up after its 5 s wait. Changing it would also make `core` depend on
  `shared`.
- **The offer has no section switch.** It follows the promotion's switch and dates (C1, C3), so
  there's one control, not two.
- **Links between inner pages are not filtered yet:** team → videos, achievements → shows,
  shows → videos and the spotlight's "Watch a recital". A switched-off page's guard sends these
  to the home page. They'll be filtered when the inner pages become editable (1.8.0). Menus,
  the footer and every home-page link to an inner page are filtered now.
- **The Shows teaser cards stay when the Shows page is off,** but they stop being links (no
  `href`).

---

**Approval:** ☐ Pending
