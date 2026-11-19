# 04 · Verification — Roles and approvals (2.0.0–2.0.2) (2026-11-20)

The owner released each merge as it went live: 2.0.0 (PR #49, the waiting lock, with #45–#48 before it), 2.0.1 (PR #51,
photo permissions) and 2.0.2 (these tests and records). The checks below ran on `chore/0019-verification`, from `main`
at `27bc207` (2.0.1) plus this branch's tests and documents; the app's code is the same as 2.0.1.

| Check                               | Result                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                    | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                                                                                                                                                                                                                                                                        |
| Unit tests                          | ✔ 1,712 site tests (308 files); 67 function tests                                                                                                                                                                                                                                                                                                         |
| Coverage                            | ✔ site: statements 99.18 %, branches 96.85 %, functions 98.43 %, lines 99.25 %; function: statements 99.10 %, branches 97.87 %, functions 100 %                                                                                                                                                                                                           |
| Build                               | ✔ initial 499.89 kB raw (1.13.0: 499.60 kB), no budget warnings: everything for roles is in the admin area's lazy chunks                                                                                                                                                                                                                                  |
| `npm run e2e`                       | ✔ 477 of 477 on 2.0.1's branch, three sizes, including `admin-team-access.e2e.ts` and `admin-approvals.e2e.ts` (a manager's menu, dashboard, photo library, sending, the lock, withdrawing, approving, sending back, axe)                                                                                                                                 |
| `npm run test:rules`                | ✔ 247 of 247: roles, drafts, approvals and locks; managers' live content, `site/config` parts, history (a 22-write publish), photos; owner-only areas; the owner unchanged                                                                                                                                                                                |
| `npm run e2e:firebase`              | ✔ 39 of 39, three sizes. New in `firebase-roles.e2e.ts`: Team access adds a manager, who sends a change for approval and finds the page locked; the owner approves it and it goes live, all through the real rules; a manager's crafted requests for a hidden page and for live content are refused (403), while the same token may draft a page they see |
| `npm audit --omit=dev`              | ✔ 0 vulnerabilities in production dependencies                                                                                                                                                                                                                                                                                                            |
| Sonar quality gate                  | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                                                                                                                                                                       |
| Lighthouse                          | ☐ Not run for 2.0.x: the public site's code didn't change (the same initial download, give or take 0.3 kB)                                                                                                                                                                                                                                                |
| Firestore rules on the live project | ☐ The owner to confirm `npm run deploy:rules` with the 2.0.0 rules                                                                                                                                                                                                                                                                                        |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                           | Result                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The manager sees only the editor pages allowed, and nothing of the owner's (leads, visits, backups, access) | ✔ `access.guards.spec.ts`, `editor-nav`, `dashboard.*.spec.ts`; `admin-approvals.e2e.ts`                                                  |
| "Needs approval": the manager sends for approval; the owner sees it waiting, with a badge                   | ✔ `review.model.spec.ts`, `publish-page.view-model.spec.ts`, `editor-layout.*.spec.ts`; `admin-approvals.e2e.ts`, `firebase-roles.e2e.ts` |
| A waiting change: approved, it goes live; sent back, the manager sees why and can carry on                  | ✔ `approval.service.spec.ts`, `approvals-panel.*.spec.ts`; `admin-approvals.e2e.ts`, `firebase-roles.e2e.ts`                              |
| "Can publish": it goes live without the owner, and the history says who                                     | ✔ `publish-page.view-model.spec.ts`, `publish-page.model.spec.ts`; `firestore-manager-publish.rules.spec.ts`                              |
| Uploads off: refused by the screen, the rules and the upload function                                       | ✔ `media-upload.*.spec.ts`; `firestore-manager-publish.rules.spec.ts`; `uploader-token.spec.ts`                                           |
| Anything not allowed, tried outside the screen, is refused                                                  | ✔ `firestore-roles.rules.spec.ts`, `firestore-manager-publish.rules.spec.ts`; `firebase-roles.e2e.ts` (crafted requests)                  |
| The owner loses nothing, and no mistake on Team access can lock them out                                    | ✔ owner fixed by UID; `role-form.spec.ts` and the rules refuse the owner's UID; "owner unchanged" rules tests                             |
| An account the owner hasn't added is told it has no access                                                  | ✔ `access.service.spec.ts`, `access.guards.spec.ts`                                                                                       |

## Known gaps

- **Released before this record** by the owner's choice (ADR-0018, rule exceptions).
- **The upload function's manager check** is covered by its unit tests; the emulator suite can't run the Azure function.
- **Signing out while a page is still reading** logs Firestore "Load failed" warnings in the emulator runs (the reads are
  cancelled by the navigation). Harmless; to quieten separately.
- **The NG02952 console error** (an empty `ngSrc`) still shows in e2e runs, as since 1.8.0.

---

**Approval:** ☐ Approved by \_\_\_\_ on \_\_\_\_
