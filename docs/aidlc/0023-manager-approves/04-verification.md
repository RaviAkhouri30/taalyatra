# 04 · Verification — A manager who can approve (2.4.0) (2026-11-20)

The checks below ran on `feat/0023-manager-approves` before its release commits; the release commits changed only
`CHANGELOG.md` and the version.

| Check                  | Result                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, diagrams, typecheck, coverage, function tests, production build |
| Unit tests             | ✔ 1,963 site tests                                                              |
| Coverage               | ✔ statements 99.24 %, branches 96.63 %                                          |
| Build                  | ✔ initial 507.39 kB raw, unchanged; no budget warnings                          |
| `npm run e2e`          | ✔ 543 of 543 in the first full run. New: `admin-self-approval.e2e.ts`           |
| `npm run test:rules`   | ✔ 297 of 297 (12 new: `firestore-self-approval.rules.spec.ts`)                  |
| `npm run e2e:firebase` | ✔ 42 of 42                                                                      |
| `npm audit --omit=dev` | ✔ no dependency added                                                           |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                             |
| Lighthouse             | ☐ Not run: the public site's code didn't change                                 |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                                         | Result                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A **Can approve their own changes** switch on Team access, off by default, with its line                                  | ✔ `manager-form.component.spec.ts`, `manager-card.component.spec.ts`, `role.model.spec.ts`                   |
| **Approve and publish** on Needs approval pages, with an optional title and description; Can publish and Hidden as before | ✔ `publish-page.model.spec.ts`, `publish-page.view-model.spec.ts`, `publish-bar.component.spec.ts`; e2e      |
| The history shows "self-approved by …" with title and description; the dashboard counts them                              | ✔ `publish-history.component.spec.ts`, `dashboard.view-model.spec.ts`; e2e (the owner signs in afterwards)   |
| A request already waiting can be approved by its manager the same way                                                     | ✔ `approval-card.component.spec.ts`, `approvals-panel.view-model.spec.ts`                                    |
| Without the switch the rules refuse; with it, only together with the self-approval's record                               | ✔ `firestore-self-approval.rules.spec.ts` (no record, a reused one, one that already existed, a hidden page) |
| No WCAG 2.2 AA violations on Review & publish and the dialog; first download unchanged                                    | ✔ axe in `admin-self-approval.e2e.ts` on three sizes; 507.39 kB                                              |

## Known gaps

- **Team access with the switch on has no axe scan of its own here**; 0024's suite scans Team access with a manager's
  switches showing.
- **"Since you last looked" is per device** (a recorded decision): another device counts the same self-approvals again.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
