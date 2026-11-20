# 04 · Verification — The owner's areas for chosen managers (2.3.0) (2026-11-21)

The checks below ran on `feat/0022-manager-areas` before its release commits; the release commits changed only
`CHANGELOG.md` and the version.

| Check                  | Result                                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint (0 warnings), 83 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                                                        |
| Unit tests             | ✔ 1,944 site tests (36 new); 67 function tests                                                                                                                                                                                                        |
| Coverage               | ✔ statements 99.23 %, branches 96.61 %, functions 98.6 %, lines 99.35 %; function 99.1 %                                                                                                                                                              |
| Build                  | ✔ initial 507.39 kB raw, unchanged; no budget warnings                                                                                                                                                                                                |
| `npm run e2e`          | ✔ 532 of 537 in the full run. Team access (three sizes) failed on an old locator, the uploads switch among five; fixed, then 9 of 9. Adding a team member and a video (desktop) timed out, then passed 12 of 12. New: `admin-manager-areas.e2e.ts`, 9 |
| `npm run test:rules`   | ✔ 285 of 285 (18 new: `firestore-manager-areas.rules.spec.ts`, and signed lead changes)                                                                                                                                                               |
| `npm run e2e:firebase` | ✔ 42 of 42 (the emulator's "RunQuery failed" warnings, as before)                                                                                                                                                                                     |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                                                                 |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                                                                   |
| Lighthouse             | ☐ Not run: the public site's code didn't change                                                                                                                                                                                                       |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                  | Result                                                                                                      |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Four switches on Team access with their lines, all off for every manager until turned on           | ✔ `manager-form.component.spec.ts`, `role-form.spec.ts`, `role.model.spec.ts`; `admin-manager-areas.e2e.ts` |
| An area on: in the menu, dashboard, tour and Features; off: not, and the rules refuse its data     | ✔ `manager-areas.spec.ts`, `dashboard.view-model.spec.ts`, `access.guards.spec.ts`; the rules spec          |
| Leads: see and change status, signed; deleting stays the owner's                                   | ✔ `lead.model.spec.ts`, `lead-card.component.spec.ts`, the rules spec; e2e (who changed it)                 |
| Visits and speed: see them, and add past days up                                                   | ✔ the rules spec (read, `visitDays` create, `visits` and `vitals` delete); e2e (the Visits page)            |
| Backups: download, leads only with Leads; restoring stays the owner's                              | ✔ `backup-panel.component.spec.ts`; e2e                                                                     |
| Going back only over publishes of pages they may publish                                           | ✔ `manager-areas.spec.ts` (`canGoBackOver`), `publish-history.component.spec.ts`                            |
| A switch turned off takes effect at the next request                                               | ✔ the rules read the role on every request (the rules spec, each area on and off)                           |
| No WCAG 2.2 AA violations on Team access, Leads and Visits for a manager; first download unchanged | ✔ axe in `admin-manager-areas.e2e.ts`; 507.39 kB                                                            |

## Known gaps

- **Going back by a manager isn't in the e2e**, only in unit tests: the fake history has no publish of a manager's own pages.
- **Hover colours half-way through fading** are skipped by the new e2e's scans; once settled they pass.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
