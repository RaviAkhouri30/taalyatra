# 03 · Construction — Foundation

| #   | Increment            | Key files                                                                                        |
| --- | -------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Rules                | `CLAUDE.md`                                                                                      |
| 2   | Runtime deps (exact) | `package.json`: bootstrap 5.3.8, bootstrap-icons 1.13.2, firebase 13.1.0, @emailjs/browser 5.0.3 |
| 3   | Strict compiler      | `tsconfig.json` (strict, path aliases), `tsconfig.e2e.json`                                      |
| 4   | Lint                 | `eslint.config.mjs`, `angular.json → lint`                                                       |
| 5   | Unit coverage        | `angular.json → test` (90 % thresholds, lcov)                                                    |
| 6   | E2E                  | `playwright.config.ts`, `e2e/` (Page Objects, axe fixture)                                       |
| 7   | Sonar                | `sonar-project.properties`, `npm run sonar`                                                      |
| 8   | Styles               | `src/styles/_tokens.scss`, `_bootstrap.scss` (selective)                                         |
| 9   | App shell            | `app.ts/html/scss/spec`, `app.config.ts`, `index.html`, `main.ts`                                |
| 10  | Security             | `autoCsp`, `.gitignore` secrets, audit overrides                                                 |
| 11  | Docs and versioning  | `docs/**`, `CHANGELOG.md`, release scripts                                                       |

## Deviations

- The placeholder `app.html` (344 lines) was replaced, since it broke the 300-line rule.
- The `sonarqube-scanner` devDependency was dropped (unpatched `node-forge`). The scanner runs via pinned `npx`.
- The e2e landmark check uses `toBeAttached()` until a routed page gives `<main>` some height.

---

**Approval:** ☐ Pending
