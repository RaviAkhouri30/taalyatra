# 04 · Verification — Editor foundation (1.6.0) (2026-11-01)

Local checks ran on `main` at `054fb2b`, the merge of PR #15.

| Check                                                       | Result                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, production build                              |
| Unit tests                                                  | ✔ 752 of 752 in 191 files                                                                       |
| Coverage (stmts / branches / funcs / lines)                 | ✔ 99.77 % / 98.37 % / 99.51 % / 99.95 %                                                         |
| Build                                                       | ✔ initial 491.15 kB raw, 114.14 kB transfer; editor page 19.01 kB raw, 5.40 kB transfer (lazy)  |
| `npm run e2e`                                               | ✔ 270 of 270 on desktop, tablet and mobile (axe 0 violations on all six editor views)           |
| `npm run test:rules`                                        | ✔ 69 of 69 (run 2026-10-31; no code or rules changed since)                                     |
| `npm run e2e:firebase`                                      | ✔ 15 of 15, including admin edit, preview and publish (run 2026-10-31; no code changed since)   |
| `npm audit`                                                 | ✔ 0 high or critical; 0 in production dependencies; 35 moderate in dev tools (`firebase-tools`) |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                             |
| Live build                                                  | ✔ the live site serves `main-3C2GRMLV.js`, the same file a build of `054fb2b` produces          |
| Live rules                                                  | ✔ deployed 2026-11-01; the active ruleset is identical to `firestore.rules`                     |
| Live data                                                   | ✔ an export after the seed (57 documents) matches `fake-db.json` exactly                        |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **67–82** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.8–4.3 s, CLS ✔ 0 (3 runs; see below)             |
| Lighthouse, live home page, desktop                         | ✔ 97–98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.2–1.3 s, CLS ✔ 0 (3 runs)                              |
| Owner's check on the live `/admin`                          | ☐ To be confirmed by the owner: sign in, change a heading, check the preview, publish, undo     |

## Mobile performance

**Mobile is below target, as it was in 1.5.0.** The live runs scored lower than 1.5.0's 89, so I
checked whether 1.6.0 caused that. The machine was busy (load average about 8, with file sync
using several cores), and blocking time ranged from 310 to 840 ms between live runs.

To compare fairly, I built both versions and served them locally with gzip against the live data,
taking turns for 7 mobile runs each (Lighthouse 13.6.0):

| Median         | 1.5.0   | 1.6.0   |
| -------------- | ------- | ------- |
| Performance    | 84      | 81      |
| LCP            | 3.78 s  | 3.96 s  |
| Blocking time  | 249 ms  | 335 ms  |
| Main-thread    | 2.60 s  | 2.74 s  |
| CLS            | 0       | 0       |

| All Performance scores | Runs                 |
| ---------------------- | -------------------- |
| 1.5.0                  | 80, 83, 88, 87, 86, 80, 84 |
| 1.6.0                  | 73, 80, 81, 60, 83, 82, 81 |

- **Most of the drop from 89 was machine load:** 1.5.0 itself only reached a median of 84 under the
  same conditions.
- **1.6.0 may also be slightly slower.** Every median is a little worse, but the gaps are small next
  to the spread between runs, so this doesn't prove a real slowdown. Re-measure on an idle machine.
- **No extra Firestore query:** the live trace shows the same two queries, because `site/visibility`
  comes back in the `site` read. The initial bundle grew by 2.93 kB in transfer.

Getting under the target still needs build-time prerendering, which needs an ADR.

---

**Approval:** ☐ Pending
