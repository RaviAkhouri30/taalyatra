# 04 · Verification — More themes, and your own saved (2.9.0, 2.9.1) (2026-11-22)

## 2.9.0 · 12 ready-made themes, and your own saved (V23)

The checks below ran on `feat/0027-more-themes` before merging.

| Check                  | Result                                                                                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify`       | ✔ format, lint, 100 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                                                                                       |
| Unit tests             | ✔ 2,175 site tests (67 new); 194 function tests                                                                                                                                                                                                                          |
| Coverage               | ✔ statements 99.24 %, branches 96.63 %, functions 98.6 %, lines 99.35 %                                                                                                                                                                                                  |
| Build                  | ✔ initial 509.36 kB raw, unchanged; no budget warnings                                                                                                                                                                                                                   |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers: 620 of 636 in 8.5 minutes, load average about 15; the 16 failures were all on mobile, mostly timeouts. The seven specs they were in then passed 45 of 45 on mobile. New: `admin-saved-themes.e2e.ts`, and 36 theme publishes |
| `npm run test:rules`   | ✔ 335 of 335 (13 new: `firestore-saved-themes.rules.spec.ts`; the 12 keys through `firestore-theme.rules.spec.ts`)                                                                                                                                                       |
| `npm run e2e:firebase` | ✔ 40 of 42 on its own single worker, in twice its usual time; the 2 timeouts passed on rerun                                                                                                                                                                             |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                                                                                    |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                                                                                      |
| Lighthouse             | ☐ Not run: the public site's code changed only in leaving the theme's name unchecked                                                                                                                                                                                     |

### Acceptance criteria

| Criterion (from the [inception](01-inception.md))                              | Result                                                                                                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| At least 14 ready-made themes, each passing every pair, checked by a unit test | ✔ 16; `site-theme.model.spec.ts` checks each. Each is also published and scanned by axe on the site and the admin, three sizes (Sandstone fixed) |
| **Save as my theme** lists it under **Your themes**, on every device           | ✔ `saved-themes.service.spec.ts`, `saved-themes.view-model.spec.ts`; e2e. Stored in Firestore, so every device reads it                          |
| Choosing a saved theme fills the form as a draft; nothing live until published | ✔ `theme-panel.view-model.spec.ts`, `theme-panel.component.spec.ts`; e2e (everything comes back, fonts too)                                      |
| Rename and delete change the list, not the site                                | ✔ the service and view model specs, `saved-themes-panel.component.spec.ts`; e2e (the form is left as it was)                                     |
| A theme failing the contrast check isn't saved, and the page says which pair   | ✔ `saved-themes.view-model.spec.ts`; e2e. ◐ it names how many pairs; the contrast panel above lists which                                        |
| Nothing changes for visitors, first download included                          | ✔ the rules keep saved themes from visitors (`firestore-saved-themes.rules.spec.ts`); 509.36 kB                                                  |
| No WCAG 2.2 AA violations on the Theme page, three sizes                       | ✔ axe in `admin-saved-themes.e2e.ts`, with saved themes and a rename showing                                                                     |

### Known gaps

- **The contact note wasn't in the contrast check** (since 0021): axe found it with Sandstone's first colours. Sandstone
  was fixed in 2.9.0, and 2.9.1 adds the pair to the Theme page's check.
- **The 20-theme limit is tested in unit tests only.**
- **Screenshots only for the first four themes**; the twelve new ones are checked by axe.

## 2.9.1 · The contact note in the contrast check

The checks below ran on `fix/0027-contrast-note`.

| Check                  | Result                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 100 diagrams, typecheck, coverage, function tests, production build                |
| Unit tests             | ✔ 2,179 site tests (4 new); 194 function tests                                                     |
| Coverage               | ✔ statements 99.24 %, branches 96.62 %, functions 98.6 %, lines 99.35 %                            |
| Build                  | ✔ initial 509.36 kB raw, unchanged; no budget warnings                                             |
| `npm run e2e`          | ✔ 636 of 636 in the first full run, on 8 workers in 6.5 minutes; all 16 ready-made themes pass axe |
| `npm run test:rules`   | ✔ not affected: no rules change                                                                    |
| `npm run e2e:firebase` | ✔ 42 of 42 in 1.8 minutes, on its own single worker                                                |

| Criterion (the open question in [construction](03-construction.md))         | Result                                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| The Theme page and publishing check the contact note at 4.5:1, with the fix | ✔ `theme-contrast.spec.ts`, `publish-report.model.spec.ts`           |
| A theme already published keeps showing on the site                         | ✔ `theme-contrast.spec.ts` (`isReadable` with only the note failing) |
| Every ready-made theme, today's look included, passes it                    | ✔ `site-theme.model.spec.ts` (each theme); axe on each, published    |

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
