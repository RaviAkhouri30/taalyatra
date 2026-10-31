# 03 · Construction — Editor foundation (1.6.0)

Built from the approved [design](02-design.md) on `feat/admin-editor`, one commit per increment.

| #   | Increment                         | Files                                                                                                                                                                                                                                                                 | Tests                                 |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | Admin write rules (D13, D14)      | `firestore.rules`: `isAdmin()` by UID; shapes for `site/config`, `site/visibility` and the eight 1.6.0 home documents; `drafts` and `publishes` admin-only. `HomeSection`, `SitePage`, `SiteWidget`; `CONTENT_MAX_LENGTH`. The emulator admin uses the production UID | rules (32 new)                        |
| 2   | Visibility on the site (D10, D11) | `SiteVisibility`, `SiteVisibilityService` (always emits; missing = all on); `applyVisibility`, `visibleLink`; `pageEnabledGuard` (`canMatch`); home page view model; shell widgets; "See all" links of the videos, team and shows teasers and the proof section       | unit, e2e                             |
| 3   | Offer schedule (D12)              | `CLOCK`; `PromotionSchedule`, `PromotionStatus`; `IPromotionDto` gains `live`, `startsOn`, `endsOn`; a promotion outside its dates counts as none                                                                                                                     | unit                                  |
| 4   | Document store (D1, D17)          | `IDocumentStore`; `FirestoreConnection` (one gateway for all Firebase adapters); gateway `commit` (`writeBatch`); `FirebaseDocumentStore`; `FakeDataStore` shared by `FakeHttpsService` and `FakeDocumentStore`; factory                                              | unit, smoke                           |
| 5   | Editor domain (D2–D5, D9, D18)    | field schemas for four tabs with a drift guard against `fake-db.json`; `buildFormGroup`, `readSchemaValue`, `mergeSchemaValue`; `DraftService`, `PublishService`; `PublishReport` with schema, offer-date and placeholder rules                                       | unit                                  |
| 6   | Preview (D6)                      | `APP_PREVIEW`; `DraftOverlayBackend`; draft contract in `core/interfaces/i-draft.ts`; `PreviewBannerComponent` (noindex); the fake sign-in persists across reloads                                                                                                    | unit                                  |
| 7   | Editor UI (D7, D8, D19, D20)      | `EditorLayoutComponent`, `DashboardComponent`, `EditorPageComponent`, `SchemaFieldsComponent`, `SchemaFieldComponent`, `PreviewFrameComponent`, `PublishPageComponent` and their view models; `unsavedChangesGuard`; routes; the placeholder admin home is removed    | unit, e2e (14 journeys × 3 viewports) |
| 8   | Seed safety (D16)                 | `seed:firestore` creates missing documents only (`--overwrite` replaces after listing; the emulator is reset in full); `export:firestore` to `backups/` (git-ignored); Firebase smoke: admin edit, preview and publish                                                | smoke                                 |
| 9   | Docs                              | ADR-0013, ADR-0014, ADR-0015; ADR-0010 update; overview, class diagram, component tree, sequences 7–8, visibility flow, data model, deployment; CLAUDE.md commands, ports and tokens; README; CHANGELOG                                                               | —                                     |

## Checks

- **`npm run verify`:** passes. 191 test files, 752 tests. Coverage: statements 99.77 %, branches
  98.37 %, functions 99.51 %, lines 99.95 %. Initial bundle 491.15 kB raw, 114.14 kB transfer
  (1.5.0: 479.98 kB and 111.21 kB). The editor is lazy: `editor-page-component` is 19.01 kB raw
  (5.40 kB transfer) and `admin-routes` 9.54 kB (3.30 kB).
- **`npm run e2e`:** 269 of 270 passed. The failure was a home tablet baseline ("failed to take
  two consecutive stable screenshots", the known WebKit race under load); that spec passed 48 of
  48 on its own. The 42 editor tests pass, with axe at 0 violations on all six editor views.
- **`npm run test:rules`:** 69 passed.
- **`npm run e2e:firebase`:** 15 passed, including the admin editing, previewing and publishing
  on the emulator through the real rules. Run with `E2E_FIREBASE_PORT=4320`, because another
  project's dev server held 4310.
- **Auth token proof (the design's main risk):** in the app's order (Firestore Lite first, Auth
  loaded later), the admin's write is allowed; signed-out and other-account writes are refused.
- **Production, read-only:**
  - The seed dry run plans only `create site/visibility`; existing documents are kept.
  - The export saved 56 documents to `backups/firestore-2026-10-31.json`, without proposals.

## Decisions & deviations from design

- **`site/layout` is named `site/visibility`** (with `SiteVisibility` and
  `SiteVisibilityService`). The shell already had a `layout` (`PageLayout`).
- **Anchor scrolling is unchanged (D11).** A link to a hidden section already stays at the top,
  after `AnchorScrollService`'s 5 s wait. Changing it would make `core` depend on `shared`.
- **The offer has no section switch:** it follows its own switch and dates (C1, C3).
- **Links between inner pages aren't filtered yet** (team → videos, achievements → shows,
  shows → videos, the spotlight's "Watch a recital"). A switched-off page's guard sends them home.
  They'll be filtered when the inner pages become editable (1.8.0).
- **The Shows teaser cards stay when the Shows page is off**, but stop being links.
- **The preview frame never binds `src`.** The design's `<iframe [src]>` would need
  `bypassSecurityTrustResourceUrl`, which Sonar flags and CLAUDE.md allows only with approval.
  The frame has a fixed `src="/?preview=1"`. Scrolling changes the hash of its current address;
  each save loads `/?preview=1&v=<n>#<section>`.
  - Found in testing: the site's router drops `?preview` from the address after the first load,
    so `location.reload()` reloaded the live site. Every reload therefore names the preview
    address.
  - A save that lands during the frame's first load is held until that load finishes.
- **Inline confirmation instead of a dialog** for publish and undo: the same content, focusable
  in place, with no dialog focus trap to maintain.
- **Editor labels and hints live in code** with the schemas (ADR-0014), not in `pages/admin`:
  they describe the data model and aren't site content. The dashboard's welcome copy still comes
  from `pages/admin.home`.
- **Static-only classes became functions** (`buildFormGroup`, `readSchemaValue`…): lint forbids
  classes with only static members, and the existing factories and validators set the precedent.
- **Stored dates are untrusted:** an unreadable `savedAt` or `publishedAt` is shown as stored
  instead of breaking the page (found by a spec).
- **The preview skips the intro animation:** it reloads after every save, and a 3.5 s intro each
  time would hide the change being checked.
- **Field ids and card ids have separate prefixes** (`field-…`, `card-…`). Found in e2e: section
  `hero` + field `title` collided with the card heading `hero-title`.
- **Only the tabs and the save status are sticky.** The whole account bar filled a third of a
  phone screen.
- **`E2E_FIREBASE_PORT`** moves the smoke suite's dev server; the default stays 4310.

## For the release (operations)

- `pages/admin.home.lead` changed ("Content editing arrives in the next update" is replaced).
  The default seed keeps existing documents, so this release needs one `--overwrite` seed. That's
  safe once: no owner edits exist yet. Back up first with `export:firestore`.
- Deploy order: export → deploy rules → deploy app → seed with `--overwrite` → sign in and check
  the dashboard.

---

**Approval:** ☐ Pending
