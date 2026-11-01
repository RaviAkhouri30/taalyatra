# 04 · Verification — Performance & SEO (2026-10-30)

| Check                                                       | Result                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, production build                                           |
| Unit tests                                                  | ✔ 534 passed                                                                                                 |
| Coverage (stmts / branches / lines)                         | ✔ 99.82 % / 98.76 % / 100 %                                                                                  |
| Build                                                       | ✔ initial 479.98 kB raw, 111.21 kB transfer                                                                  |
| `npm run e2e`                                               | ⚠ 227 of 228. The Shows tablet baseline hit the WebKit "two consecutive stable screenshots" race; see below  |
| `npm run test:rules`                                        | ✔ 37 of 37 (rules unchanged in this feature)                                                                 |
| `npm run e2e:firebase`                                      | ✔ 12 of 12, against the code on `main`                                                                       |
| `npm audit` (on `main` at `054fb2b`, 2026-11-01)            | ✔ 0 high or critical; 0 in production dependencies; 35 moderate in dev tools (`firebase-tools`)              |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                          |
| Live SEO files and tags                                     | ✔ canonical link, Open Graph tags, share image, `robots.txt` (blocks `/admin`), `sitemap.xml` (5 pages)      |
| Missing `.xml` file on the live site                        | ✔ returns 404                                                                                                |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **89** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.6 s, CLS ✔ 0                                                     |
| Lighthouse, live home page, desktop                         | ✔ 98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.2 s, CLS ✔ 0                                                           |

**The e2e failure is a known flake, not a regression.** The diff was anti-aliasing noise. On its own,
`home-visual.e2e.ts` passed 144 of 144 (3 repeats). The whole suite later passed 270 of 270 on
`main` at `054fb2b`, which contains this feature.

**Before and after on the live site (Lighthouse 13.6.0):**

| Device  | Measure     | 1.4.1 | 1.5.0 |
| ------- | ----------- | ----- | ----- |
| Mobile  | Performance | 73    | 89    |
| Mobile  | CLS         | 0.339 | 0     |
| Mobile  | LCP         | 3.5 s | 3.6 s |
| Desktop | Performance | 86    | 98    |
| Desktop | CLS         | 0.158 | 0     |
| Desktop | LCP         | 1.2 s | 1.2 s |

**Mobile is still below target.** Performance is 89 against 95, and LCP is 3.6 s against 2.5 s. Layout
shift is fixed; LCP isn't, because nothing paints until the app has started and read its data. Options
are in [ADR-0016](../../architecture/adr/0016-mobile-lcp.md).

---

**Approval:** ☐ Pending
