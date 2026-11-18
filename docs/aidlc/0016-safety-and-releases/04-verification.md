# 04 · Verification — Nothing lost, and what's new (1.12.0) (2026-11-18)

1.12.0 and 1.13.0 ([0018](../0018-visits-and-leads/04-verification.md)) went live in the same update: PR #41 and PR #42
merged before either was released. The checks on the combined `main` (`cda3710`), the live build and Lighthouse are in
[0018's record](../0018-visits-and-leads/04-verification.md); this record adds what 0016's own branch showed.

| Check                                   | Result                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run verify` (branch, `2d96cd2`)    | ✔ 1,420 site tests (268 files), 52 function tests; statements 99.31 %; initial 499.48 kB                 |
| `npm run e2e` (branch)                  | ✔ 426 of 429; the 3 others were the dashboard's screenshots, re-recorded after look approval (`4e2f11e`) |
| `npm run test:rules`                    | ✔ 157 of 157 on the branch (7 new for `adminState`); 189 of 189 on `main`                                |
| `npm run e2e:firebase`                  | ✔ 27 of 27 on the branch; 33 of 33 on `main`                                                             |
| Combined `main`, live build, Lighthouse | See [0018's record](../0018-visits-and-leads/04-verification.md): all checks pass, speed unchanged       |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                   | Result                                                                                   |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A "New" marker until What's new is opened; every release's notes, newest first, from `CHANGELOG.md` | ✔ `release-notes.spec.ts`, `editor-layout.component.spec.ts`; `admin-safety.e2e.ts`      |
| A backup is offered after a publish; the dashboard and Review & publish remind after 14 days        | ✔ `backup-status.model.spec.ts`, `publish-bar.component.spec.ts`; `admin-safety.e2e.ts`  |
| A backup downloads a file and keeps a copy in this browser                                          | ✔ `backup.service.spec.ts`; `admin-safety.e2e.ts`                                        |
| Restoring puts the content in the draft, for Review & publish                                       | ✔ `backup.service.spec.ts`; `admin-safety.e2e.ts`                                        |
| A foreign or damaged file changes nothing and says why                                              | ✔ `backup-file.spec.ts`; `admin-safety.e2e.ts`                                           |
| Going back to any of the last 20 publishes warns about later ones and offers a backup first         | ✔ `publish.service.spec.ts`, `publish-history.component.spec.ts`; `admin-safety.e2e.ts`  |
| A change that couldn't be saved is offered back, or thrown away                                     | ✔ `safety-copy.service.spec.ts`, `editor-page.view-model.spec.ts`; `admin-safety.e2e.ts` |
| None of this is in the public pages' download                                                       | ✔ initial 499.48 kB on the branch; the backup and file code load with the admin routes   |

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-19.
