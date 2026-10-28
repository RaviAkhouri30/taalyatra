# 04 · Verification — Admin sign-in (2026-10-29)

| Check                                                       | Result                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify` (on `main` at `cad4b90`)                   | ✔ format, lint (0 warnings), typecheck (app, spec, e2e, rules), coverage, production build                                                             |
| Unit tests                                                  | ✔ 523/523 in 148 files                                                                                                                                 |
| Coverage (stmts / branches / funcs / lines)                 | ✔ 99.82 % / 98.8 % / 99.72 % / 100 %                                                                                                                   |
| Build                                                       | ✔ initial 476.51 kB raw, 110.39 kB transfer; Firestore SDK and Auth SDK in lazy chunks                                                                 |
| `npm run e2e`                                               | ✔ 228/228 on desktop Chrome, iPad, Pixel 7 (axe 0 violations on every page)                                                                            |
| `npm run test:rules`                                        | ✔ passed in CI (GitHub Actions, Java 21) on every push to `main`                                                                                       |
| `npm run e2e:firebase` (emulator smoke)                     | ☐ Not run: needs Java locally, and CI doesn't run it yet                                                                                               |
| `npm audit`                                                 | ✔ 0 high/critical; 0 in production dependencies; 5 moderate in dev tools (`firebase-tools` → `uuid`)                                                   |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                    |
| Live site (`calm-mud-0ca950310.4.azurestaticapps.net`)      | ✔ every route opens directly (after 1.4.1); every page renders from Firestore with 0 console errors                                                    |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **73** / ✔ 100 / ✔ 100 / ✔ 100. LCP 3.5 s, CLS 0.339, TBT 100 ms, FCP 1.1 s                                                                         |
| Lighthouse, live home page, desktop                         | ❌ **86** / ✔ 100 / ✔ 100 / ✔ 100. LCP 1.2 s, CLS 0.158, TBT 0 ms                                                                                      |
| Auth SDK split                                              | ✔ public pages request no auth code; `/admin/sign-in` loads the `auth-gateway` chunk (23 kB transfer)                                                  |
| Firebase console                                            | ✔ Email/Password on, self sign-up **off**, authorized domains include `taalyatra.in` and the Azure domain, email sender domain `taalyatra.in` verified |
| Live `/admin`                                               | ✔ opens directly (after 1.4.1), shows sign-in, `noindex`                                                                                               |
| Real-account sign-in                                        | ☐ To be confirmed by the owner (their password is never shared)                                                                                        |

**Performance is below target.** Two causes, reproduced with Lighthouse-like throttling (CPU ×4, slow 4G):

1. **Hero illustration before hero text (mobile, CLS ≈ 0.39).** `<main>` is revealed when site config arrives. The hero text comes from the `home` collection a moment later; on phones the hero is one column, so the text pushes the already-painted illustration and the marquee down.
2. **Font swap (mobile and desktop).** Google Fonts loads with `display=swap`. The fallback font wraps the hero buttons onto two lines; DM Sans fits them on one, and the lead text moves 44 px.
3. **LCP 3.5 s on slow 4G:** app bundle → Firestore SDK chunk → data → render.

Planned for 1.4.2 (needs approval): render the hero illustration together with the hero text; a font strategy (metric-matched fallback faces, or `display=optional`); `modulepreload` for the Firestore gateway chunk.

---

**Approval:** ☐ Pending
