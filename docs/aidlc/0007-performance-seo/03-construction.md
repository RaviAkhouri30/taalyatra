# 03 · Construction — Performance & SEO

Built from the approved [design](02-design.md) on `feat/performance-seo`.

| #   | Increment                        | Files                                                                                                                                                                                                                                        | Tests     |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Hero in one pass (D1)            | `home-hero.component.html`: the stage illustration sits inside `@if (model.data())`                                                                                                                                                          | unit      |
| 2   | No empty containers              | `home-marquee` and `home-trust` render nothing until their data arrives (they caused the remaining 0.105 mobile CLS)                                                                                                                         | unit      |
| 3   | Fallback fonts (D2)              | `src/styles/_fonts.scss` (four `@font-face` rules on `local('Arial')` / `local('Arial Bold')`), second in `$font-display` and `$font-body`                                                                                                   | —         |
| 4   | Lighter photos (D3)              | WebP next to every experience, drum-circle and team JPEG (75–83 % smaller); `fake-db.json` points at the `.webp` files                                                                                                                       | —         |
| 5   | `postbuild` (D4, D7)             | `scripts/postbuild.mjs`: fills `%SITE_URL%` in `index.html`, adds `<link rel="modulepreload">` for the chunk that contains the Firestore client, writes `robots.txt` and `sitemap.xml`                                                       | build     |
| 6   | SEO per route (D5)               | `IAppEnvironment.siteUrl`; `RouteData.Description` and a description on every public route; `IPageMeta`; `resolvePageMeta`; `SeoService` (description, canonical, Open Graph, Twitter); called from `SiteShellViewModel`'s navigation stream | unit      |
| 7   | Structured data (D6)             | `toLocalBusiness(site, siteUrl)`: `LocalBusiness` JSON-LD from `site/config`; `sameAs` keeps real profile URLs only                                                                                                                          | unit      |
| 8   | Static share tags and image (D8) | `index.html`: canonical, Open Graph and Twitter tags (scrapers don't run JavaScript); `public/images/og/taal-yatra.jpg` (1200×630, 73 kB)                                                                                                    | —         |
| 9   | Accessible names (D9)            | brand link text gets its missing space; game pads read "Drum pad Boom bass" (label and sub-label, matching the visible text)                                                                                                                 | unit, e2e |
| 10  | Hosting                          | `staticwebapp.config.json`: `xml` added to the fallback exclusions, so a missing `sitemap.xml` returns 404                                                                                                                                   | —         |
| 11  | E2E hardening                    | `home-rhythm-game.e2e.ts`: the wait for "Your turn!" allows 15 s, because pattern playback outlasted the default 5 s under a full parallel run                                                                                               | e2e       |

## Checks

- **`npm run verify`:** passes. 534 tests. Coverage: statements 99.82 %, branches 98.76 %,
  lines 100 %. Initial bundle 479.98 kB raw, 111.21 kB transfer.
- **`npm run e2e`:** 227 passed, 1 failed. The failure was the Shows tablet baseline: WebKit
  "failed to take two consecutive stable screenshots" while the illustrations rendered, and the
  diff is anti-aliasing noise only. On its own, `home-visual.e2e.ts` passed 144/144 (3 repeats),
  and the rhythm-game spec passed 30/30 (5 repeats). CI runs one worker with two retries.
- **Rules tests:** 37 passed (rules unchanged in this feature).
- **Firebase smoke suite:** not run yet. A Firestore emulator left over from an earlier session
  holds port 8080, and the suite starts its own emulators. It runs in Verification.
- **`modulepreload` under strict CSP:** the production build's `index.html` carries the link,
  and Chrome fetches the Firestore chunk in parallel with `main.js` with no CSP violation.
- **Lighthouse** (13.6.0, home page):

  | Run                                  | Device  | Perf | A11y | BP  | SEO | LCP   | CLS   |
  | ------------------------------------ | ------- | ---- | ---- | --- | --- | ----- | ----- |
  | Live 1.4.1 (before)                  | mobile  | 73   | 100  | 100 | 100 | 3.5 s | 0.339 |
  | Live 1.4.1 (before)                  | desktop | 86   | 100  | 100 | 100 | —     | 0.158 |
  | Local build, live data, gzip (after) | desktop | 98   | 100  | 100 | 100 | 1.1 s | 0     |
  | Local build, live data, gzip (after) | mobile  | 73   | 100  | 100 | 100 | 3.6 s | 0     |

  Locally measured mobile TBT (690 ms) is this machine's noise; the live site measured 100 ms.
  The live re-measurement is recorded in Verification.

## Decisions & deviations from design

- **D3 ships as WebP files with new names,** not JPEGs re-encoded in place. WebP is far smaller
  at the same quality. The data now points at `.webp`, so **the Firestore seed must run after
  deploy**. The JPEGs stay, so the old data keeps working until then.
- **Video cards are unchanged (D9).** Their `aria-label` ("Watch {title}") already contains the
  visible title, which is what WCAG 2.5.3 (Label in Name) asks for. The `aria-label` replaces the
  content's name anyway, so hiding the duration badge would change nothing.
- **Marquee and trust gating** wasn't in the design. A throttled trace showed their empty
  containers collapsing as the cause of the remaining mobile shift.
- **`distinctUntilChanged` was removed** from the shell's navigation stream: the page meta
  changes on every navigation, even when the layout doesn't.
- **Mobile LCP stays above 2.5 s.** It's bounded by the Firestore round trip before the hero
  copy can render. Getting under the target needs build-time prerendering of the home page
  (SSG), which changes the architecture and needs an ADR. It's proposed as a follow-up.
- **Verification tooling:** the local server needed gzip to make mobile LCP comparable with
  Azure Static Web Apps.

---

**Approval:** ☐ Pending
