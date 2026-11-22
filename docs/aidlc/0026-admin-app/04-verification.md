# 04 · Verification — The admin on your phone (2.8.0) (2026-11-22)

The checks below ran on `feat/0026-admin-app` before merging; the release commit changed only the version.

| Check                  | Result                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 97 Mermaid diagrams render, typecheck, coverage, function tests, production build                      |
| Unit tests             | ✔ 2,108 site tests; 194 function tests                                                                                 |
| Coverage               | ✔ statements 99.22 %, branches 96.62 %                                                                                 |
| Build                  | ◐ initial 509.36 kB raw (119.73 kB compressed), 1.29 kB more than 2.7.0, 0.64 kB under the warning; no budget warnings |
| `npm run e2e`          | ✔ 588 of 588 in the first full run, on 8 workers in 6.1 minutes. New: `admin-app.e2e.ts`                               |
| `npm run test:rules`   | ✔ not affected: no rules change                                                                                        |
| `npm run e2e:firebase` | ✔ 42 of 42 in 2.1 minutes, on its own single worker                                                                    |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                  |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                    |
| Lighthouse             | ☐ Not run: the public site's pages are unchanged but for the shared-code regrouping                                    |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                               | Result                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Android: **Install app** offered; installed, full screen at `/admin` with its icon and name     | ◐ e2e: the manifest's fields, `scope`, `display` and icons load; the Install button with a simulated offer. ☐ on the phone |
| iPhone: **Add to Home Screen** gives the app's icon and name, full screen, below the status bar | ◐ e2e: the iPhone tags and `viewport-fit=cover` on admin pages. ☐ on the phone                                             |
| Links stay in the app; **View site** opens the browser                                          | ◐ `scope` `/admin` (e2e); **View site** already opens a new tab. ☐ on the phone                                            |
| A new release shows on the next open                                                            | ✔ by design: no service worker, nothing cached. ☐ on the phone, after the next release                                     |
| The public site: no install offer; first download unchanged                                     | ✔ no manifest or iPhone tags on the home page (e2e). ◐ download +1.29 kB (construction)                                    |
| **Help → Install on your phone**: steps for both, and the Install button when offered           | ✔ `install-page.view-model.spec.ts`, `install-page.component.spec.ts`, `help-menu.component.spec.ts`; e2e                  |
| No WCAG 2.2 AA violations on the new page, three sizes                                          | ✔ axe in `admin-app.e2e.ts`                                                                                                |

## Known gaps

- **No test can install an app.** The phone checks in 05 are the only proof of AC 1–4.
- **The icons are placeholders** from the 156 px logo, until the original logo arrives (inception D4).
- **The first download grew 1.29 kB**, with 0.64 kB left under the 510 kB warning.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
