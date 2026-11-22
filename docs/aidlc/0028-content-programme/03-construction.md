# 03 · Construction — The home sections (2.10.0)

Built on the approved [inception](01-inception.md) (D1–D6) and [design](02-design.md).

| #   | Increment         | Files                                                                                                                                                                                                                                                                                                                           | Tests                                                                                                                                                                                                |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Schemas and pages | `home-content-limits.constants.ts`; `ContentPath` (9 documents), `EditorTab` (6 pages); `home-parts.ts`, `home-story.sections.ts` (scrolling words, trust strip, audience cards, philosophy, call to action), `home-lists.sections.ts` (cities, how, Instagram, testimonials, FAQ); `editor-tabs.ts`, the menu, Find's keywords | `home-story.sections.spec.ts`, `home-lists.sections.spec.ts`: today's content of every card loads into its form unchanged, and no part of any document is left without a field; `home-parts.spec.ts` |
| 2   | Features          | `home-features.constants.ts` (the home page's entries, six new), `i-feature.ts` (the types), `features.constants.ts` re-exports them                                                                                                                                                                                            | the Features specs                                                                                                                                                                                   |
| 3   | The cities anchor | `PageAnchor.Cities`, the section's `anchor`, `visibility.constants.ts`                                                                                                                                                                                                                                                          | `editor-tabs.spec.ts` (Where we play is clickable in the preview)                                                                                                                                    |
| 4   | Rules             | `homePages()`, `draftPages()`, `approvablePaths()`, `publishablePaths()`, a role's page keys; `EDITABLE_HOME_SECTIONS`                                                                                                                                                                                                          | `firestore-home-sections.rules.spec.ts` (33): owner, manager publishing, needing approval, drafting, hidden, self-approving, shapes, the role                                                        |
| 5   | E2E and records   | `admin-home-sections.e2e.ts`; component tree, data model, CHANGELOG                                                                                                                                                                                                                                                             | FAQ and a city published to the site, the trust strip, an Instagram photo from the library, axe on the six pages; three sizes                                                                        |

## Decisions & deviations from design

- **The Features page's home entries moved to their own file**, `home-features.constants.ts`, with the types in
  `i-feature.ts`: six more entries would have taken `features.constants.ts` past 300 lines.
- **One old rules test changed:** it checked that the admin couldn't change a section the editor didn't cover, using
  the FAQ. It now uses the chat's script, the one home section still uncovered until 2.12.0.
- **`EDITABLE_HOME_SECTIONS` gained the nine documents**, so the admin's existing rules test now changes each of them
  too (a list section by its items, as it has no title).
- **Instagram photos are decorative to the editor:** the caption describes each post, so a description isn't
  required, as the site already shows them.
- **Twelve dashboard baselines re-recorded** (the editor's dashboard, and the three pictured themes' dashboards, on
  three sizes). The new sections' `[placeholders]` now count in **Still to fill in** (84 in the sample content,
  listing Our philosophy, Where we play, Instagram and Testimonials), and the longer menu makes the page taller. Each
  was checked by eye before re-recording; the site's own screenshots didn't change.
- **The first download grew 0.02 kB** (509.36 → 509.38 kB), for the cities anchor; 0.62 kB left under the warning.
- **No dependency added.**

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.

# 2.11.0 · The inner pages, and search titles and descriptions

Built on the approved [design](02-design.md) (2.11.0).

| #   | Increment               | Files                                                                                                                                                                                                                                  | Tests                                                                                                                                                                                                                  |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Titles and descriptions | `SeoPage`, `ISeoText`, `PAGE_META`; `ROUTE_DATA_KEYS.Seo` (replacing `Description`), `app.routes.ts`, `resolvePageMeta`; `ISiteConfig.seo`, `SiteConfigModel`; `SeoService`; `SeoTitleStrategy` in `app.config.ts`                     | `page-meta.constants.spec.ts`, `seo-title.service.spec.ts`; `SeoService` with and without stored text, an empty one keeping the default; `SiteConfigModel` reading `seo`; `resolvePageMeta` naming the page            |
| 2   | The preview's page      | `IEditorSection.page`; `EditorPageViewModel.activePage`, `blur()`; `PreviewFrameComponent.page`; `PreviewScroller` (an inner page's top); `cardForAnchor` (home cards only)                                                            | the frame opening a card's page before and after its first load, reloading that page after a save, moving to the section once it has loaded; the scroller; the view model (`editor-page-preview.view-model.spec.ts`)   |
| 3   | Cards, pages and menu   | `page-content-limits.constants.ts`; `ContentPath` (4 documents), `EditorTab` (Achievements, Search and sharing); `page-parts.ts`, `inner-pages.sections.ts`, `achievements.sections.ts`, `seo.sections.ts`; tabs, menu, Find, Features | `inner-pages.sections.spec.ts`: today's content of every card loads unchanged, no part of any page is left without a field, each card previews its page; `seo.sections.spec.ts`; `page-parts.spec.ts`; the count specs |
| 4   | Rules                   | `innerPages()`, `match /pages/{page}`, `isValidInnerPage`; `draftPages()`, `canDraft`, `approvablePaths()`, `publishablePaths()`, the config keys; `isValidSeo`; a role's page keys; the publish record's check                        | `firestore-inner-pages.rules.spec.ts` (31): owner, manager publishing, needing approval, drafting, hidden, self-approving, `pages/admin` refused, shapes, Search and sharing alone, the role                           |
| 5   | E2E and records         | `admin-inner-pages.e2e.ts`; component tree, data model, CHANGELOG                                                                                                                                                                      | the Team page's heading in its preview and then on `/team`; the Videos page's title and description in its tab and description tag; a milestone on `/achievements`; axe on the two new pages; three sizes              |

## Decisions & deviations from design

- **The routes name their page; they no longer hold its title and description.** The design had the routes read
  `PAGE_META`. Doing so took the first download over its budget (510.42 kB against 510), so a public route now carries
  only its `SeoPage`, and `SeoService` takes the title and description from the stored text or `PAGE_META`. The first
  download is 509.94 kB: **0.06 kB left** under the warning, which the next public change will need to make room for.
- **A small title strategy, `SeoTitleStrategy`.** The router sets the tab's title just after the navigation ends,
  which would overwrite the owner's stored title. The strategy leaves the title to `SeoService`, which sets it on
  every navigation (the admin's titles included, from their routes).
- **The rules' evaluation limit.** Firestore evaluates at most 1,000 expressions per document written. Measured with
  the emulator's coverage report, each of the two lists of a manager's pages costs about 450, and a self-approved
  publish record built both, so the new pages took it over the limit. Two changes, no change in who may do what:
  - a record that carries a self-approval is checked against the pages the manager sees only, as those include the
    pages they may publish (the admin sends a self-approval only from a manager who can approve);
  - `isValidSeo` is written out rather than through `isOptionalText`, which cost several times as much.
- **Typing in a card keeps the preview on it.** The e2e test found that filling a field scrolls nearby cards into
  view, and the preview followed them back to the home page. While a card has focus, scrolling no longer moves the
  preview; once it's left, it follows again.
- **An inner page's top.** Inner pages have no `#top` section, so the preview's scroller goes to the page's own top.
  When the preview switches to an inner page while the home page is still loading its later sections, the dev
  server logs those aborted loads ("Importing a module script failed"); the old page is being replaced, so nothing
  shows.
- **Achievements has a menu group of its own, "Other pages"**, as it has no home section to sit beside; Features
  gains the same group. Search and sharing sits under Settings, after Business details.
- **Today's site settings gain an empty `seo`** in `fake-db.json` (the editor's shape check needs every field it
  writes to exist), and the rules tests' fixture now stores the `pages` documents too.
- **No dependency added.**

---

**Approval (2.11.0):** ☑ Approved by Ravi Akhouri on 2026-11-23.
