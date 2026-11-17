# 04 · Verification — Site and editor polish (1.10.0) (2026-11-18)

Local checks ran on `48620a3`; `main` at `41f2bf2`, the merge of PR #35, has the same files.

| Check                                                       | Result                                                                                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                                                                                    |
| Unit tests                                                  | ✔ 1,301 site tests; 52 function tests                                                                                                                                 |
| Coverage (statements)                                       | ✔ site 99.64 %; function 100 %                                                                                                                                        |
| Build                                                       | ✔ initial 499.89 kB raw (1.9.0: 499.88 kB), no budget warnings; the drag library loads with the editor only                                                           |
| `npm run e2e`                                               | ✔ 363 of 378; the 15 others are screenshot comparisons of the changed sections, awaiting the owner's look approval (see Known gaps); 0 "ResizeObserver loop" warnings |
| `npm run test:rules`                                        | ✔ 150 of 150                                                                                                                                                          |
| `npm run e2e:firebase`                                      | ✔ 27 of 27                                                                                                                                                            |
| `npm audit --omit=dev`                                      | ✔ 0 vulnerabilities in production dependencies                                                                                                                        |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                   |
| Live rules                                                  | ✔ released 2026-11-17 19:59 UTC, before the merge; identical to `firestore.rules`                                                                                     |
| Live build                                                  | ✔ its chunks contain the Order panel, the folding settings and the folding sections                                                                                   |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **89–91** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.36–3.79 s, CLS ✔ 0, TBT 43–98 ms (3 runs)                                                                              |
| Lighthouse, live home page, desktop                         | ✔ 98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.13–1.17 s, CLS ✔ 0 (2 runs)                                                                                                     |

**Speed is unchanged** (1.9.0: mobile 88–93, desktop 97–98). Mobile stays below its target, as recorded in ADR-0016.

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                        | Result                                                                              |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Reorder by dragging or Move up/down, and the site shows the new order                    | ✔ Unit tests; browser check (drag, arrows, publish, home page order)                |
| The featured item is first, marked, and can't be moved below the others                  | ✔ Unit tests; `admin-collections.e2e.ts`                                            |
| Our philosophy and Good to know fold everywhere; the others on phones only               | ✔ Unit tests; screenshots; `home-journeys.e2e.ts`                                   |
| Find on page opens a folded section                                                      | ✔ `hidden="until-found"` and `beforematch`, unit-tested; not automated in a browser |
| Folding follows the owner's choice in Sections & pages after publishing                  | ✔ Unit tests; rules tests                                                           |
| Drum circle: one picture on the right; text, smaller tags and the button on the left     | ✔ Unit and browser tests; screenshots                                               |
| WhatsApp and Call pass 3:1 and animate a few times, then rest; still with reduced motion | ✔ Contrast 9.4:1 and 5.0:1 (dark icons); axe 0 violations                           |
| The initial download stays under 500 kB                                                  | ✔ 499.89 kB                                                                         |

## Known gaps

- **The screenshot baselines** for the changed sections are still the old ones, until the owner approves the new look; then
  `npm run e2e:visual:update` re-records them.
- **A console error that predates this release** shows in every e2e run (about 360 times): `NgOptimizedImage` given an empty
  `ngSrc`. It appears in runs from 1.8.0 too. To investigate separately.

---

**Approval:** ☐ Pending
