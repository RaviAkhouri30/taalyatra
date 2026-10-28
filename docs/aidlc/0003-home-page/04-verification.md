# 04 · Verification — Home page (2026-10-26)

| Check                                       | Result                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run verify`                            | ✔ format, lint (0 warnings), typecheck (app, spec, e2e), coverage, production build         |
| Unit tests                                  | ✔ 269/269 in 82 files                                                                       |
| Coverage (stmts / branches / funcs / lines) | ✔ 99.74 % / 98.85 % / 99.55 % / 100 %                                                       |
| Build                                       | ✔ initial 458.33 kB raw / 105.29 kB transfer; home-page chunk 18 kB, sections deferred      |
| `npm run e2e`                               | ✔ 108/108 on desktop Chrome, iPad, Pixel 7 (journeys, axe in 4 page states, 48 screenshots) |
| Design parity                               | ✔ computed styles match the prototype at 6 widths, apart from documented deviations         |
| `npm audit`                                 | ✔ 0 vulnerabilities                                                                         |
| Sonar quality gate                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                         |
| Lighthouse (perf / a11y / bp / seo)         | ☐ Not run yet                                                                               |

Visual baselines in `e2e/specs/home-visual.e2e.ts-snapshots/` are macOS (`-darwin`) images.
A Linux CI runner needs its own baselines (`npm run e2e:visual:update` in the CI image).

---

**Approval:** ☐ Pending
