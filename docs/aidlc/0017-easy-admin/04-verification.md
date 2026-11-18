# 04 · Verification — An admin anyone can use (1.11.0) (2026-11-18)

Local checks ran on `main` at `7805915`, the merge of PR #38 (same files as `6c6f625`).

| Check                                                       | Result                                                                                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                                                                       |
| Unit tests                                                  | ✔ 1,322 site tests (250 files); 52 function tests                                                                                                        |
| Coverage                                                    | ✔ site: statements 99.29 %, branches 97.3 %, functions 98.87 %, lines 99.4 %; function 100 %                                                             |
| Build                                                       | ✔ initial 499.89 kB raw (1.10.0: 499.89 kB), no budget warnings; Find and the new menu load with the editor only                                         |
| `npm run e2e`                                               | ✔ 390 of 408; the 18 others are screenshot comparisons awaiting the owner's look approval (see Known gaps); 0 "ResizeObserver loop" warnings             |
| `npm run test:rules`                                        | ✔ 150 of 150 (rules unchanged)                                                                                                                           |
| `npm run e2e:firebase`                                      | ✔ 27 of 27 (on the branch, before the merge)                                                                                                             |
| `npm audit --omit=dev`                                      | ✔ 0 vulnerabilities in production dependencies                                                                                                           |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                      |
| Live build                                                  | ✔ deployed 04:39 UTC; its chunks contain Find, "Still to fill in", "Undo changes", "Show or hide sections", "Contact & social links" and "Photo library" |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **89–91** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.49–3.62 s, CLS ✔ 0, TBT 46–104 ms (3 runs)                                                                |
| Lighthouse, live home page, desktop                         | ✔ 97 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.19–1.24 s, CLS ✔ 0 (2 runs)                                                                                        |

**Speed is unchanged** (1.10.0: mobile 89–91, desktop 98): this release changes only the admin. Mobile stays below its target,
as recorded in ADR-0016.

## Acceptance criteria

| Criterion (from the [design](02-design.md))                                                        | Result                                                                            |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| U1 The menu lists the home sections in page order, then Settings; a section's cards are on one tab | ✔ `editor-tabs.spec.ts`, `editor-layout.component.spec.ts`; `admin-editor.e2e.ts` |
| U1 Old `/admin/content` links still open the editor                                                | ✔ `admin-find.e2e.ts` (redirect to Hero)                                          |
| U2 Find goes to a field and puts the cursor in it; says when nothing matches                       | ✔ `find-index.spec.ts`, `editor-jump.service.spec.ts`; `admin-find.e2e.ts`        |
| U3 Every to-do on the dashboard has a Fix link to its field, grouped by section                    | ✔ `dashboard.component.spec.ts`; `admin-find.e2e.ts`                              |
| U4 Plain words: Undo changes, Still to fill in, Show or hide sections, Photo library               | ✔ Unit and browser tests; live build                                              |
| U5 Character counts appear only from 80 % of the limit; flatter cards                              | ✔ `schema-field.component.spec.ts`; screenshots                                   |
| U6 Phones: one-row top bar, account in the Menu drawer, Show preview in the publish bar            | ✔ `admin-sign-in.e2e.ts`, `firebase-smoke.e2e.ts` (mobile); screenshots           |
| Walkthrough F1–F7 fixed; F8–F10 recorded for later                                                 | ✔ [design](02-design.md#second-walkthrough-after-u1u6)                            |
| axe: 0 violations on the admin pages, all three screen sizes                                       | ✔ admin e2e                                                                       |
| The initial download stays under 500 kB                                                            | ✔ 499.89 kB                                                                       |

## Known gaps

- **The screenshot baselines** are still the old ones until the owner approves the new look: the dashboard (3, this release)
  and the home sections from 1.10.0 (15). Then `npm run e2e:visual:update` re-records them.
- **A console error that predates this release** shows in every e2e run (370 times in this one): `NgOptimizedImage` given an
  empty `ngSrc` (NG02952). It appears in runs from 1.8.0 too. To investigate separately.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18.
