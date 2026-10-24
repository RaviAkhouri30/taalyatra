# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org).
See [docs/versioning.md](docs/versioning.md).

## [Unreleased]

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
