# 04 · Verification — Real-phone speed reports (1.8.0) (2026-11-05)

Local checks ran on `19cf814`; `main` at `55d4a1d`, the merge of PR #28, has the same files.

| Check                                                       | Result                                                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                                              |
| Unit tests                                                  | ✔ 1,208 site tests; 52 function tests                                                                                           |
| Coverage (stmts / branches / funcs / lines)                 | ✔ site 99.71 % / 97.95 % / 99.44 % / 99.88 %; function 100 %                                                                    |
| Build                                                       | ✔ initial 499.91 kB raw, 116.72 kB transfer, with no budget warnings; measuring chunk about 2 kB                                |
| `npm run e2e`                                               | ✔ 360 of 360 on desktop, tablet and mobile, in one clean run; axe 0 violations                                                  |
| `npm run test:rules`                                        | ✔ 144 of 144                                                                                                                    |
| `npm run e2e:firebase`                                      | ✔ 27 of 27, including a real page's report through the real rules, shown on the dashboard                                       |
| `npm audit`                                                 | ✔ 0 high or critical; 0 in production dependencies; 29 moderate in dev tools                                                    |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                             |
| Live build                                                  | ✔ the live site serves `main-X646R4JQ.js`, the same file the local build produces                                               |
| Live rules                                                  | ✔ deployed 2026-11-04, before the merge; the active ruleset is identical to `firestore.rules`                                   |
| Live report                                                 | ✔ a real browser on the live home page sent one report after 9 s, with only the agreed fields and no page errors; it was stored |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **89–90** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.33–3.78 s, CLS ✔ 0, TBT 84–185 ms (3 runs)                                       |
| Lighthouse, live home page, desktop                         | ✔ 97–98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.20–1.25 s, CLS ✔ 0, TBT 0 ms (3 runs)                                                  |

**The reports didn't slow the site down.** Mobile scored 89–90 against 1.7.0's 85–89, on a quieter machine, so the small rise isn't an
improvement either. Mobile stays below target, which is what these reports will help decide.

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                   | Result                                                                |
| ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| With enough visits, the report shows speed per device against 2.5 s | ✔ Unit tests; real data on the dashboard is still to come             |
| With too few visits, it says so and suggests no answer              | ✔ Unit and browser tests                                              |
| Measuring doesn't delay the page                                    | ✔ It starts 3 s after load, in its own chunk; Lighthouse is unchanged |
| A report can't identify the visitor                                 | ✔ Exact fields enforced by rules; checked on the live request         |
| A browser asking not to be tracked sends nothing                    | ✔ Unit tests                                                          |
| A failure is never noticed                                          | ✔ Unit tests                                                          |
| The admin area and previews aren't counted                          | ✔ Unit tests                                                          |

## Known gaps

- **Six test reports are in the live data from this check, plus one from the live test.** Lighthouse's runs sent reports, because the
  block I set for them didn't work: three simulated "phones" and three "desktops". They disappear after 30 days, the next time
  the report is loaded. Three in the 200 phone visits needed won't change the answer.
- **Automated visitors are counted.** The same thing shows that Lighthouse, and probably crawlers that run JavaScript, send reports like
  a real visit. This should be fixed before the numbers are relied on.
- **Sonar** has not run on this release, as on the ones before it.

---

**Approval:** ☐ Pending
