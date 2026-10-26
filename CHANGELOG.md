# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org).
See [docs/versioning.md](docs/versioning.md).

## [Unreleased]

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
