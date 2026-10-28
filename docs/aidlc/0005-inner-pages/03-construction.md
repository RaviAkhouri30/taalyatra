# 03 · Construction — Inner pages

Built from the approved [design](02-design.md) on `feat/inner-pages` (stacked on
`feat/firebase-data`). Each increment was linted, typechecked and unit-tested before the next one
started.

| #   | Increment | Files | Tests |
| --- | --------- | ----- | ----- |
| 1   | Shared data and caching (ADR-0011) | `cache-latest.util.ts`; `SiteConfigService`, `VideosService`, `TeamService` cached; new `ShowFormatsService` and `IShowFormatDto`; `site/config` gains `labels.watchVideo` and `credit`; `fake-db.json` gains `pages/*` and `showFormats`, and drops `home/shows.formats` and `home/videos.watchLabel` | unit |
| 2   | Home teasers on shared sources | home Shows reads `showFormats`; home Videos reads `labels.watchVideo`; both use the cached getters; `IVideoCard` and `toVideoCards()` move to `shared` | unit |
| 3   | Independent preloads | adapter caches each of `site`, `home`, `pages` separately (no more `forkJoin`); `FirestorePath.id` | unit |
| 4   | Footer credit | `footer-credit` component in both footer variants, from `site/config.credit`, linking to LinkedIn | unit |
| 5   | Rules | `pages/*` and `showFormats/*` read-only; rules spec extended | written (needs Java) |
| 6   | Shared UI | `app-page-cta`; `app-video-card` gains a `Featured` variant, `eyebrow`, `priority`; `.vcat` label style; sage tokens | unit |
| 7   | Videos page | `features/videos`: model (derived categories, filter, labels), service, view model, page, routes | unit |
| 8   | Team page | `features/team`: model, service, view model, `team-card`, page, routes | unit |
| 9   | Shows page | `features/shows`: model (format specs), service, view model, `show-format-card`, page, routes | unit |
| 10  | Achievements page | `features/achievements`: model, service, view model, page, routes | unit |
| 11  | Routes | `/videos`, `/team`, `/shows`, `/achievements` (lazy, `PageLayout.Page`, titles); `**` still falls back to home until Admin exists | e2e |
| 12  | E2E | `InnerPage` page object and an `innerPages` fixture; `inner-pages.e2e.ts` (direct open, reach from the home teaser, axe), `videos-filter.e2e.ts`, `inner-visual.e2e.ts` (48 new baselines) | e2e |

## Checks

- **`npm run verify`:** passes. 118 test files, 408 tests. Coverage: statements 99.79 %,
  branches 98.9 %, functions 99.65 %, lines 100 %. Initial bundle 465.86 kB raw, 107.68 kB
  transfer. Each page is its own lazy chunk of 2.0–2.4 kB transfer.
- **`npm run e2e`:** 195 passed, on desktop, tablet and mobile. That includes axe WCAG 2.2 AA
  with 0 violations on all four pages, and the home visual baselines unchanged.
- **Browser check (dev server, Fake backend, 1440×900 and 390×844):** all four pages render with
  their titles and headings. Angular warnings: none after marking the featured video thumbnail
  and the first row of team photos as `priority` (NG02955, LCP image).
- **Not run yet:** `npm run test:rules` and the Firebase smoke suite (both need Java); CLS and
  Lighthouse against live data (these need the 0005 data seeded, which must wait for the 1.3.0
  deploy, see below).

## Decisions & deviations from design

- **One copy per show format.** The home teaser and the Shows page now share one record. Where
  their wording differed, the existing home wording was kept: "instead of standing on a stage"
  (the prototype's Shows page says "rather than"), and "Fest stage show" (the Shows page says
  "Fest & stage show").
- **The YouTube channel button uses the site's YouTube social link** (`site/config.socials`)
  instead of a URL stored on the Videos page. If no YouTube profile is configured, the button is
  dropped and "Plan your session" becomes the only, solid button.
- **The featured video's description is the video's `caption`,** and its link name is the shared
  "Watch {title} on YouTube" instead of the prototype's generic "the featured video". Nothing new
  is stored.
- **"Plan your session" and the other proposal buttons link to the home page's proposal form**
  (`/#contact`). The prototype links some of them to the home page's top.
- **Accessible structure:**
  - Team skills are a list (`ul`).
  - Show specs and achievement stats are description lists (`dl`): term first for screen readers,
    with the value still drawn above the label.
  - Milestones are an ordered list.
  - Press items without an article URL render as text, not `href="#"` links.
- **Fewer child components than the design's tree.** Values, setups, stats, milestones,
  recognition, press and performances live in their page templates (each under 120 lines). Only
  the repeated cards became components (`team-card`, `show-format-card`, and the featured
  variant of `video-card`).
- **The featured video is a variant of `app-video-card`,** not a new component. It shares the
  thumbnail, play and duration styles, so no CSS is copied.
- **`e2e:visual:update` now re-records every visual suite** (`playwright test visual`).
- **Playwright fixtures can't be chosen by a computed name**, so one `innerPages` fixture holds
  the four page objects.

## Live rollout (for 05-operations)

1. **Deploy rules:** `npm run deploy:rules`. This adds read access to `pages/*` and
   `showFormats/*`, is additive, and is safe now.
2. **Deploy the 1.3.0 app and run the seed together:**
   `npm run seed:firestore -- <key> --dry-run`, then `--yes`. It writes `pages/*` and
   `showFormats/*`, and rewrites `home/shows`, `home/videos` and `site/config`.
3. **Never seed this data while a 1.2.0 build is serving.** That build reads
   `home/shows.formats`.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28

---

## Addendum A: copyable address, toasts, Shows spotlight (2026-10-28)

| #   | Increment | Files | Tests |
| --- | --------- | ----- | ----- |
| A1  | Clipboard port | `IClipboardService`, `BrowserClipboardService` (`defer(writeText)`), `FakeClipboardService`, `clipboardServiceFactory`, `provideBackend` | unit |
| A2  | Toasts | `ToastService` (forwards messages only), `toast-host` component and view model (`mergeMap` + `timer` per toast), in the site shell; `$z-toast` token | unit |
| A3  | Copy text | `app-copy-text` and its view model (`exhaustMap`); copy icon; tooltip (hover, focus, Escape) | unit + `copy-address.e2e.ts` |
| A4  | Footer "Visit us" | the address uses `app-copy-text`; the phone row reads "Call us"; labels in `site/config.labels` | unit + e2e |
| A5  | Shows spotlight | `showFormats` gains `image`, `featured` and `spotlight`; a classical tabla recital is added as the first, featured format; `ShowSpotlightModel`; shared `app-show-spotlight` | unit |
| A6  | Home Shows section | surface band, spotlight, image cards | unit + re-recorded `#shows` baselines |
| A7  | Shows page | spotlight above the cards; each card has an image | unit + re-recorded baselines |
| A8  | Illustrations | 7 SVGs in `public/images/shows/` (2.1–3.3 kB each) | rendered and reviewed |

**Checks:**
- **`npm run verify`:** passes. 128 test files, 427 tests. Coverage: statements 99.8 %,
  branches 98.95 %, functions 99.68 %, lines 100 %. Initial bundle 471.82 kB raw, 108.99 kB
  transfer.
- **`npm run e2e`:** 198 passed.
- **Visual baselines re-recorded** (17 files), as an approved visual change:
  - home `#shows` and Shows page section 2, which changed by design
  - 11 sections below them (home `play`, `philosophy`, `how`, `proof`, `faq`, `contact`; Shows
    sections 3 and 4) on some viewports. These diffs were text anti-aliasing only: the taller
    Shows section above now ends on a fractional pixel, so the content below is rasterised at a
    different sub-pixel offset.
- **Browser check:** the full address is copied, and the toast reads "Address copied to
  clipboard". The phone link reads "Call us", with the accessible name "Call us, +91 92842 76168".
  Plain loads of every page at 1440 and Pixel 7 widths show no `NgOptimizedImage` warnings.

**Decisions & deviations:**
- **The live `site/config` has `contact.phone.display = "us"`,** an edit made in the Firebase
  console. "Call us" is now a separate label (`labels.callUs`), and the display value stays the
  number, which the utility bar and the contact section show. On the owner's instruction the live
  document was not patched; the 1.3.0 seed restores the number from `fake-db.json`.
- **The tooltip is visual only** (`aria-hidden`): the button's accessible name already holds the
  full address ("Copy address: …", WCAG 2.5.3). The tooltip opens leftwards from the right edge,
  so the footer's last column can't push it off-screen.
- **The clipboard factory has one adapter.** It still exists, so only factories name concrete
  adapters (ADR-0002); specs inject the fake.
- **The clipboard e2e test reads the clipboard back on Chromium only.** WebKit (tablet) has no
  clipboard permissions, so there it checks the tooltip, the click and the toast.
- **The spotlight title is always an `h3`:** on both pages it sits under a section `h2`.
- **`NgOptimizedImage` warnings during the visual suite** (NG02952 aspect ratio, NG02955 LCP)
  come from the dev server applying component styles after images load, and from the tests
  scrolling before the largest paint settles. They don't occur on plain loads, and these checks
  don't exist in production builds.
- **Flaky test seen once:** the EmailJS adapter spec failed in one coverage run and passed in the
  next three. It looks unrelated (the file is untouched); watch it in CI.

