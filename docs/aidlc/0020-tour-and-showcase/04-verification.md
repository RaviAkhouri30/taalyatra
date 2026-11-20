# 04 · Verification — Guided tour and features showcase (2.1.0) (2026-11-20)

The checks below ran on `feat/0020-tour-and-features` before its release commits (PR #55, merged as `45c4258`); the
release commits changed only `CHANGELOG.md` and the version.

| Check                  | Result                                                                                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint (0 warnings), 78 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                                                                                                        |
| Unit tests             | ✔ 1,758 site tests; 67 function tests                                                                                                                                                                                                                                                                 |
| Coverage               | ✔ statements 99.17 %, branches 96.70 %, functions 98.43 %, lines 99.27 %                                                                                                                                                                                                                              |
| Build                  | ✔ initial 499.80 kB raw (2.0.2: 499.89 kB), no budget warnings: the tour, Help and Features are in the admin area's lazy chunks                                                                                                                                                                       |
| `npm run e2e`          | ✔ 501 of 501, three sizes (run twice: 5.6 and 5.2 minutes). New: `admin-tour.e2e.ts` (the offer once, Not now, the owner's whole tour by keyboard with every area framed, replay from Help, Escape and focus, Features links, axe); `admin-approvals.e2e.ts` (the manager's 8-step tour and Features) |
| `npm run test:rules`   | — Not needed: no rules or data-layer change                                                                                                                                                                                                                                                           |
| `npm run e2e:firebase` | — Not needed: as above                                                                                                                                                                                                                                                                                |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                                                                                                                 |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                                                                                                                   |
| Lighthouse             | ☐ Not run: the public site's code didn't change                                                                                                                                                                                                                                                       |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                             | Result                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A first sign-in on a device offers the tour; Help → Take the tour runs it again                               | ✔ `tour.service.spec.ts`, `tour-offer.component.spec.ts`, `help-menu.component.spec.ts`; `admin-tour.e2e.ts`                  |
| Each step highlights a real area, with Next, Back and Close; keyboard, screen readers, reduced motion; focus  | ✔ `tour.component.spec.ts`, `tour-target.directive.spec.ts`, `tour-placement.spec.ts`; `admin-tour.e2e.ts` (keyboard, Escape) |
| A manager's tour has only their pages and actions; the owner's has everything                                 | ✔ `tour.model.spec.ts` (owner 9 steps, manager 8, no visible page); `admin-approvals.e2e.ts`                                  |
| Features lists every feature with See it on the site and Change it, grouped as the menu is                    | ✔ `features.constants.spec.ts` (every link checked against the editor pages and site sections), `features-page.*.spec.ts`     |
| For a manager, a hidden page reads "Managed by the owner"; nothing of the owner's areas is offered            | ✔ `features-page.model.spec.ts`; `admin-approvals.e2e.ts`                                                                     |
| Each editor page says in one line what it changes; an empty list says what to add                             | ⏭ Moved to 2.1.1 (V6), with the walkthrough's list                                                                            |
| No WCAG 2.2 AA violations on the tour and the Features page, three sizes; the public first download unchanged | ✔ axe in `admin-tour.e2e.ts`; build above                                                                                     |

## Known gaps

- **The tour's look** has no screenshot baseline: its card moves with the area it points at. The e2e checks each area is
  framed and the card is on screen instead.
- **The NG02952 console error** (an empty `ngSrc`) still shows in e2e runs, as since 1.8.0.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20.
