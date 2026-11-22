# 04 · Verification — A super manager (2.5.0) (2026-11-21)

The checks below ran on `feat/0024-super-manager` before its release commits; the release commits changed only
`CHANGELOG.md` and the version.

| Check                  | Result                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 87 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                           |
| Unit tests             | ✔ 2,015 site tests; 67 function tests                                                                                                                                                                       |
| Coverage               | ✔ statements 99.2 %, branches 96.6 %                                                                                                                                                                        |
| Build                  | ✔ no budget warnings. Initial 507.49 kB raw: 0.10 kB more than 2.4.0, measured afterwards (see the gaps)                                                                                                    |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers took 1.1 hours under heavy load: 476 passed, 76 timed out. All 98 tests of the rerun passed (4 desktop, 13 tablet, 81 mobile). New: `admin-super-manager.e2e.ts` |
| `npm run test:rules`   | ✔ 322 of 322 (25 new: `firestore-super-manager.rules.spec.ts`, and `firestore-roles.rules.spec.ts`)                                                                                                         |
| `npm run e2e:firebase` | ✔ 42 of 42 in 2.2 minutes, on its own single worker                                                                                                                                                         |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                       |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                         |
| Lighthouse             | ☐ Not run: the public site's code didn't change                                                                                                                                                             |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                  | Result                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A **Super manager** switch, off by default, **For good** or **Until** a date, with its line        | ✔ `manager-form.component.spec.ts`, `role-form.spec.ts`, `role.model.spec.ts`, `manager-card.component.spec.ts`                           |
| They see and publish every page, use all four areas, and answer the queue (Approve, Send back)     | ✔ `super-manager.spec.ts`, `permissions.model.spec.ts`, `manager-areas.spec.ts`, `access.guards.spec.ts`, `approval.service.spec.ts`; e2e |
| Their answers name them; the owner's dashboard counts them                                         | ✔ `approvals-panel.model.spec.ts`, `dashboard.model.spec.ts`; e2e ("approve another manager's request for the owner, who is told")        |
| At the end they're an ordinary manager again, from the next request, without a reload              | ✔ the rules spec (time-limited cases); `access.service.spec.ts`; e2e ("end by itself at the end of the chosen day")                       |
| The last three days: the dashboard says when it ends                                               | ✔ `dashboard.model.spec.ts`; e2e ("Your super manager access ends on 30 Nov 2026.")                                                       |
| The rules still refuse Team access, deleting or trimming history, and the owner's account          | ✔ `firestore-super-manager.rules.spec.ts`, `firestore-roles.rules.spec.ts`                                                                |
| No WCAG 2.2 AA violations on Team access and a super manager's dashboard; first download unchanged | ✔ axe on both in `admin-super-manager.e2e.ts`, three sizes. ◐ first download: 507.49 kB, 0.10 kB more (below)                             |

## Known gaps

- **The first download wasn't compared at the time.** Measured at 2.6.0, which matched 2.5.0: 507.49 kB against
  2.4.0's 507.39 kB. No admin code is in it; like 2.8.0's, the growth is the bundler regrouping shared code.
- **The queue as a super manager has no axe scan of its own**; Team access and the dashboard do.
- **A page already open at the end** stays until the next navigation (a recorded decision); the rules refuse its reads
  and writes from the end moment.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
