# 04 · Verification — Editable theme (2.2.0) (2026-11-21)

The checks below ran on `feat/0021-editable-theme` before its release commits (PR #57, merged as `6027f6f`); the release
commits changed only `CHANGELOG.md`, the version and the records' approval lines.

| Check                  | Result                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint (0 warnings), 82 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                           |
| Unit tests             | ✔ 1,908 site tests (145 new); 67 function tests                                                                                                                                                          |
| Coverage               | ✔ statements 99.2 %, branches 96.62 %, functions 98.5 %, lines 99.29 %; function 99.1 %                                                                                                                  |
| Build                  | ✔ initial 507.39 kB raw, 118.39 kB compressed (2.1.1: 499.80 kB, 117.08 kB), within the new 510 kB budget; the theme model is a lazy chunk                                                               |
| `npm run e2e`          | ✔ 527 of 528, three sizes. The one failure, the chat assistant's quick answer on desktop (a 5-second wait), then passed 12 of 12 on all sizes. New: `admin-theme.e2e.ts`, 9 tests per size, 21 baselines |
| `npm run test:rules`   | ✔ 267 of 267 (20 new: `firestore-theme.rules.spec.ts`)                                                                                                                                                   |
| `npm run e2e:firebase` | ✔ 42 of 42 (the emulator's "RunQuery failed" warnings, as before)                                                                                                                                        |
| Strict CSP             | ✔ the new inline script in `index.html` is hashed in the production build's policy                                                                                                                       |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                    |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                      |
| Lighthouse             | ☐ Not run, though the design asked for it on Daylight. Its speed is covered by the build size; its accessibility by axe                                                                                  |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                      | Result                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Choose a ready-made theme or set colours, background, text size and fonts; the preview shows the draft | ✔ `theme-panel.*.spec.ts`, `theme-form.spec.ts`; `admin-theme.e2e.ts` (preview)                                           |
| A published theme reaches every page of the site and the admin; no colour left written in code         | ✔ `admin-theme.e2e.ts` (site and dashboard per theme); `site-shell.component.spec.ts`; the grep of every stylesheet       |
| A pair below 4.5:1 (text) or 3:1 (edges) is named, and blocks publishing and sending for approval      | ✔ `theme-contrast.spec.ts`, `publish-report.model.spec.ts` (`ContrastRule`); `admin-theme.e2e.ts`                         |
| A missing, unreadable or invalid theme shows today's look                                              | ✔ `site-theme.model.spec.ts`, `site-theme.service.spec.ts`, `site-theme-style.spec.ts`                                    |
| A manager's theme changes follow drafts and approval; a manager without the page doesn't see it        | ✔ `firestore-theme.rules.spec.ts`; `admin-theme.e2e.ts` (a manager sends a theme for approval)                            |
| Reset puts today's look back as a draft                                                                | ✔ `theme-panel.view-model.spec.ts`; `admin-theme.e2e.ts`                                                                  |
| No WCAG 2.2 AA violations per ready-made theme, home and an admin page, three sizes; screenshots kept  | ✔ `admin-theme.e2e.ts`, axe and baselines for Daylight, Festival and High contrast; Warm night is every existing baseline |
| Today's look unchanged; first download within budget; no layout shift when a theme applies             | ✔ every baseline but the contact form on phones (decision 1); 507.39 kB; the theme applies before the page is shown       |

## Known gaps

- **Lighthouse wasn't run on Daylight.** A non-default font adds one download; its sized fallback keeps the page still.
- **A first visit after a theme is published** shows today's background for a moment before the app starts; the device
  remembers the theme from then on (D7).
- **The chat assistant's quick-answer test** can miss its 5-second wait under a busy full run.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
