# 04 · Verification — Drum circle editor and gentle reveal (1.9.0) (2026-11-17)

Local checks ran on `1dc0f46`; `main` at `fbfc072`, the merge of PR #34, has the same files. 1.9.0 also carries what was
planned as 1.8.1 (email setup, PRs #30 and #31) and the speed-report filter (`8b49648`).

| Check                                                       | Result                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                           |
| Unit tests                                                  | ✔ 1,262 site tests; 52 function tests                                                                        |
| Coverage (stmts / branches)                                 | ✔ site 99.70 % / 97.93 %; function 100 % / 100 %                                                             |
| Build                                                       | ✔ initial 499.88 kB raw, 116.76 kB transfer, no budget warnings (1.8.0: 499.91 kB)                           |
| `npm run e2e`                                               | ✔ 378 of 378 on desktop, tablet and mobile; axe 0 violations; 0 "ResizeObserver loop" warnings               |
| `npm run test:rules`                                        | ✔ 147 of 147                                                                                                 |
| `npm run e2e:firebase`                                      | ✔ 27 of 27                                                                                                   |
| `npm audit`                                                 | ✔ 0 in production dependencies; 0 high or critical; 26 in dev tools (1 low, 25 moderate)                     |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                          |
| Live build                                                  | ✔ `main-4ZYJUOWO.js`; its chunks contain the drum circle editor, the reveal and the automated-visitor filter |
| Live rules                                                  | ✔ released 2026-11-17 16:47 UTC, before the merge; identical to `firestore.rules`                            |
| Live proposal (planned 1.8.1)                               | ✔ the owner sent one at 16:34 UTC: stored with all nine fields; the owner confirmed the email and auto-reply |
| Live speed-report filter                                    | ✔ 65 reports before and after five Lighthouse runs on the live site: none of them was stored                 |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **88–93** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.24–3.81 s, CLS ✔ 0, TBT 30–71 ms (3 runs)                     |
| Lighthouse, live home page, desktop                         | ✔ 97–98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.19–1.24 s, CLS ✔ 0 (2 runs)                                         |

**The reveal didn't slow the first screen.** Mobile is 88–93 against 1.8.0's 89–90 and LCP is in the same range; blocking
time is lower (30–71 ms against 84–185 ms). Mobile stays below its target, as recorded in ADR-0016.

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                        | Result                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Drum circle details on Music & creativity, every field the section shows | ✔ Schema test checks every stored key is edited once; browser test        |
| Pictures: choose or upload, crop, required description                   | ✔ The image field used everywhere; publish blocked without a description  |
| Publish and undo behave like every other section                         | ✔ Browser test publishes and finds the change on the home page            |
| A picture used here can't be deleted from the library                    | ✔ Usage is worked out from every editor section, this one included        |
| A section below the first screen fades in and rises once                 | ✔ Unit tests; browser test with motion on                                 |
| The first screen doesn't wait, and load speed doesn't change             | ✔ First-screen sections are never hidden; Lighthouse above                |
| Reduced motion: nothing animates                                         | ✔ Unit and browser tests                                                  |
| Links to a section show it                                               | ✔ `/#contact` lands at 0 px, browser test (before: up to 11,000 px short) |

## Known gaps

- **The drum circle editor hasn't been used on the live site yet.** It was checked locally and in the emulator suite's
  rules; the owner's first real edit is its live test.
- **The 7 test reports from 1.8.0** are still in the data until they expire (about 5 December). The 65 reports now include
  real visits and, before today's filter, some automated ones.
- Not tested live: an iPhone HEIC photo from Chrome, and a 15 MB photo (open since 1.7.0).

---

**Approval:** ☐ Pending
