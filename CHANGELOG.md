# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org).
See [docs/versioning.md](docs/versioning.md).

## [Unreleased]

## [1.4.1] - 2026-10-29

### Fixed

- Deep links on Azure Static Web Apps: opening or refreshing `/videos`, `/team`, `/shows`,
  `/achievements` or `/admin` returned 404. `navigationFallback` now serves `index.html`, and
  missing assets still return 404.
- Optional `site/config` fields (labels, credit, socials, promotion) missing from stored data no
  longer blank the footer. Each item falls back on its own: "Call us" shows the number, the
  address shows as text, the credit is left out.

### Known issues

- Lighthouse Performance on the live home page is 73 (mobile) and 86 (desktop), below the target
  of 95. CLS is 0.339 (mobile) and 0.158 (desktop), and mobile LCP is 3.5 s. Causes: the hero
  illustration paints before the hero text on phones, and the web fonts swap. A fix is planned for
  1.4.2.

## [1.4.0] - 2026-10-28

### Added

- Admin sign-in at `/admin` (email and password, Firebase Authentication), with password reset by
  email, sign-out and a guarded admin home. Only the admin UID is let in; other accounts are
  signed out (ADR-0012). Admin pages are `noindex`.
- `IAuthService` port with Firebase (lazy chunk, loaded only by `/admin`) and fake adapters.
- Typed Reactive Forms with validation: trimmed required fields, strict email (up to 254
  characters), password 6–128 characters; accessible inline errors.
- Shared form-field Sass mixins (`_forms.scss`).
- Auth emulator in the Firebase smoke suite; the seed creates emulator test accounts.

### Changed

- The licence is now proprietary, all rights reserved (it was GPL-3.0); `package.json`
  declares `"license": "UNLICENSED"`. The README has a full project description.

## [1.3.0] - 2026-10-28

### Added

- Inner pages: Videos (category filter, featured video), Team, Shows & performances, and
  Achievements, each reading its copy from `pages/*`.
- Shared entities stored once and read once per visit through cached services (`cacheLatest`):
  videos, team, show formats (new `showFormats` collection) and site config (ADR-0011).
- A classical tabla recital as the featured show format, with a spotlight on the home page and
  the Shows page; every format card has an illustrated image.
- A copyable footer address (ellipsis, tooltip, click to copy) and a toast system; an
  `IClipboardService` port.
- A footer credit, "Developed with love by Ravi Akhouri", linking to LinkedIn.
- `app-page-cta`, `app-show-spotlight`, `app-copy-text`, and a featured variant of
  `app-video-card`.

### Changed

- Preloaded Firestore collections (`site`, `home`, `pages`) load independently.
- The home Shows section moves onto the surface band, with a spotlight and image cards.
- The "Visit us" phone row reads "Call us".

## [1.2.0] - 2026-10-28

### Added

- Cloud Firestore backend (project `taal-yatra`) behind `IHttpBackend`: Firestore Lite in a lazy
  chunk, Firebase error codes mapped to HTTP statuses (ADR-0009).
- Site config (brand, contact, socials, promotion) stored in Firestore.
- Proposal requests stored in `proposals` as well as emailed; the visitor sees success if either
  works.
- `firestore.rules`: deny by default, read-only content, create-only proposals; emulator tests run
  in CI.
- Seed script (`npm run seed:firestore`), runtime Firebase config written by CI from GitHub
  secrets, and the Firebase smoke suite.

### Changed

- The site shell reveals `<main>` once site config has loaded, and `site`/`home` content arrives
  in one read: desktop CLS dropped from 0.12–0.16 to 0.0004 in local measurements.

### Notes

- App Check is deferred (ADR-0010).
- 1.2.0, 1.3.0 and 1.4.0 were deployed as their pull requests merged. `package.json` was bumped
  once, in 1.4.1.

## [1.1.0] - 2026-10-26

### Added

- Home page built from the design prototype, pixel-matched at 375–2300 px: intro loader, hero,
  marquee, trust row, Diwali offers, audiences, experiences with filter chips, shows, drum circle
  details, rhythm game, videos, gallery with photo viewer, philosophy, mid-page CTA, cities, how it
  works, team, Instagram, proof, FAQ, proposal form and chat assistant.
- Data layer: `IHttpBackend` port with `FakeHttpsService` (`fake-db.json`) and `RestHttpBackend`,
  chosen by a factory; `ApiBaseService` + `HttpsErrorHandler`; `ApiEndpoint` enum.
- Email: `IEmailService` port with EmailJS and fake adapters, chosen by configuration (ADR-0006).
- Proposal form: typed Reactive Form, accessible inline validation, email submit, and a WhatsApp
  link that carries the answers.
- Chat assistant with canned replies, typing indicator, quick questions and a floating
  call/WhatsApp/chat cluster.
- `AnchorScrollService` so `/#section` links work for sections that render after their data.
- Shared layer: site shell, header, footers, promo badge, mobile action bar, icons, buttons,
  lightbox, video card, filter chips and more.
- E2E journeys for every interactive section, axe scans in four page states, and 48 visual
  baselines (`npm run e2e:visual:update`).
- ADRs 0006–0008, home page AIDLC records, updated diagrams.

### Changed

- Below-the-fold home sections load `@defer (on idle)` (ADR-0007).

### Fixed

- Accessibility deviations from the design for contrast, covered targets and focus (ADR-0008).
- Favicon and touch icons.

## [1.0.0] - 2026-10-24

### Added

- Engineering rules and architecture in `CLAUDE.md`: MVVM, SOLID, standalone, signals + RxJS, no Promises.
- Documentation under `docs/`: architecture overview, class, sequence, flow and component diagrams, ADRs 0001–0005, AIDLC template.
- Runtime dependencies: Bootstrap 5.3.8, Bootstrap Icons 1.13.2, Firebase 13.1.0, EmailJS 5.0.3.
- Tooling: ESLint 10 (angular-eslint, typescript-eslint, sonarjs, security, prettier), Vitest coverage
  with 90 % thresholds, Playwright with axe on desktop/tablet/mobile, SonarQube config (scanner via pinned `npx @sonar/scan`).
- `overrides` for patched `@grpc/grpc-js` and `vite`, so `npm audit` reports 0 vulnerabilities.
- Strict TypeScript and Angular compiler options, path aliases, automatic strict CSP in production builds.
- Selective Bootstrap SCSS with design tokens, and a minimal accessible app shell.
