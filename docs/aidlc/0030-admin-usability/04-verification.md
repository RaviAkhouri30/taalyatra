# 04 · Verification — An admin that's easier to use (2.14.0) (2026-11-23)

The checks below ran on `feat/0030-admin-usability` before merging.

| Check                  | Result                                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 109 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                                                           |
| Unit tests             | ✔ 2,396 site tests; 194 function tests                                                                                                                                                                                                       |
| Coverage               | ✔ statements 99.24 %, branches 96.53 %                                                                                                                                                                                                       |
| Build                  | ✔ initial 509.99 kB raw (+0.05 kB, exports for the admin, nothing public); no budget warnings                                                                                                                                                |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers: 713 of 718 in 8.6 minutes (2 skipped by design); the 5 failures were the Admin editor spec on desktop timing out, which then passed 108 of 108. The Theme spec, now slow, passed in the full run |
| `npm run test:rules`   | ✔ 411 of 411: no rules change                                                                                                                                                                                                                |
| `npm run e2e:firebase` | ✔ 45 of 45, on its own single worker, after one fix: the new invite test on a phone was covered by the tour offer before its last sign-out, which it no longer needs                                                                         |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                                                        |
| Sonar, Lighthouse      | ☐ Not run (Sonar needs its token; the public site didn't change)                                                                                                                                                                             |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                            | Result                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard: Needs you first (or all caught up), then the groups; colours and icons by purpose | ✔ `dashboard.component.spec.ts`, `dashboard.model.spec.ts`, `dash-card` and `mini-bars` specs; 12 baselines checked by eye              |
| Add a manager with an email; Firebase's password email; the owner stays signed in            | ✔ `team-access.view-model.spec.ts`, the account adapters' specs; e2e; on the emulator, the invited manager sets a password and signs in |
| An email with an account, or sign-up turned off, opens the UID path                          | ✔ unit (each kind); e2e (the Fake manager's email)                                                                                      |
| Each page's setting is three buttons; Set all; the explanation as chips                      | ✔ `manager-form.component.spec.ts`; e2e (Set all to Can publish, the settings in every spec that adds a manager)                        |
| The form's boxes line up                                                                     | ✔ screenshots of the form on three sizes, checked by eye                                                                                |
| Every dropdown matches the boxes                                                             | ✔ one `forms.select` mixin on each admin select; screenshots                                                                            |
| Leads' reset in the filters' row; the publish bar only where needed                          | ✔ unit; `admin-visitors.e2e.ts`                                                                                                         |
| No change to the public site or the rules                                                    | ✔ 509.99 kB, nothing public; rules unchanged (411 of 411)                                                                               |

## Known gaps

- **0.01 kB left** under the first download's warning: any public change must make room first.
- **The full e2e run** still times out a few heavy specs under its own load on 8 workers; each passes on its own.
- **An existing account can't be found by email** from the browser, so its UID is pasted (ADR-0021).

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
