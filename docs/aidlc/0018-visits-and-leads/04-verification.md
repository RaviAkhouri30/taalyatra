# 04 · Verification — Visits and leads (1.13.0) (2026-11-18)

1.12.0 ([0016](../0016-safety-and-releases/04-verification.md)) and 1.13.0 went live in the same update: PR #41 and PR #42
merged before either was released. These checks cover both. `main` at `cda3710` (the merge of PR #42) has the same files
as `7166f4c`, where the local checks ran.

| Check                                                       | Result                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                                                                                                                                                                         |
| Unit tests                                                  | ✔ 1,546 site tests (287 files); 52 function tests                                                                                                                                                                                                          |
| Coverage                                                    | ✔ site: statements 99.28 %, branches 97.05 %, functions 98.71 %, lines 99.38 %; function 100 %                                                                                                                                                             |
| Build                                                       | ✔ initial 499.60 kB raw (1.11.0: 499.89 kB; 1.12.0 on its branch: 499.48 kB), no budget warnings; the visit counter loads after the page, in the speed reports' chunk                                                                                      |
| `npm run e2e`                                               | ✔ 443 of 447 on `main`; the other 4 were test faults, now fixed: a text match also found “this version” in the 1.13.0 notes, and the dashboard screenshot held the newest release's notes (now hidden there). Those two spec files then passed: 129 of 129 |
| `npm run test:rules`                                        | ✔ 189 of 189 (32 new: visits, visit days, leads)                                                                                                                                                                                                           |
| `npm run e2e:firebase`                                      | ✔ 33 of 33: a real visit counted and added into a daily total, and a lead's status changed, through the real rules                                                                                                                                         |
| `npm audit --omit=dev`                                      | ✔ 0 vulnerabilities in production dependencies                                                                                                                                                                                                             |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                                                                        |
| Live build                                                  | ✔ deployed 15:47 UTC; the chunks with Visits, Leads, "Include leads", the visit counter, backups and going back are byte-for-byte those of a local build of `main`                                                                                         |
| Firestore rules on the live project                         | ✔ deployed by the owner (`npm run deploy:rules`), 2026-11-19                                                                                                                                                                                               |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **90–91** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.50–3.56 s, CLS ✔ 0, TBT 36–93 ms (3 runs)                                                                                                                                                                   |
| Lighthouse, live home page, desktop                         | ✔ 98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.17–1.19 s, CLS ✔ 0 (2 runs)                                                                                                                                                                                          |

**Speed is unchanged** (1.11.0: mobile 89–91, desktop 97): the visit is sent from the chunk that already loads after the
page. Mobile stays below its target, as recorded in ADR-0016.

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                                  | Result                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| One anonymous visit per opening; not robots, test browsers, previews, opt-outs or the owner's browser              | ✔ `browser-visit-source.spec.ts`, `visitor.spec.ts`; `firebase-smoke.e2e.ts`            |
| The first download stays within 500 kB; counting starts after the page has loaded                                  | ✔ 499.60 kB; `browser-vitals-reporter.spec.ts`                                          |
| Visits and proposals by day, week, month and year                                                                  | ✔ `chart.spec.ts`, `visits-page.*.spec.ts`; `admin-visitors.e2e.ts`                     |
| Leads: every proposal newest first, filters, status, CSV export, delete after a warning                            | ✔ `leads-page.*.spec.ts`, `lead-card.component.spec.ts`; `admin-visitors.e2e.ts`        |
| The menu and dashboard show how many leads are new                                                                 | ✔ `editor-layout.component.spec.ts`, `dashboard.model.spec.ts`; `admin-visitors.e2e.ts` |
| "Include leads" adds them to a backup, which is only downloaded                                                    | ✔ `backup.service.spec.ts`, `backup-panel.view-model.spec.ts`; `admin-visitors.e2e.ts`  |
| Only the admin reads, changes or deletes leads and visit counts; visitors only add a well-formed visit or proposal | ✔ `firestore-leads.rules.spec.ts`                                                       |
| axe: 0 violations on Visits and Leads, all three screen sizes                                                      | ✔ `admin-visitors.e2e.ts`                                                               |

## Known gaps

- **Counting started with this update**: the graphs show visits from 18 Nov 2026 on.
- **The NG02952 console error** (an empty `ngSrc`) still shows in e2e runs, as since 1.8.0. To investigate separately.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-19.
