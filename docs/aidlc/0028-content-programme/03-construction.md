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
