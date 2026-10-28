# Taal Yatra

The website of **Taal Yatra**, a drum circle and live music company in Kharadi, Pune. It runs
facilitated drum circles, music workshops and live shows (including Hindustani classical tabla
recitals) for corporate teams, families, schools and festivals. The site explains the
experiences and helps visitors request a proposal by form or WhatsApp.

> **Proprietary code. All rights reserved.** The repository is public for reference only. You
> may not copy, use, modify, deploy or distribute any part of it without written permission. See
> [LICENSE](LICENSE).

## Features

- **Home page:** hero and experiences; Diwali offers; who it's for; shows, with a classical
  concert spotlight; a playable rhythm game; videos; gallery with a photo viewer; team; FAQ.
- **Inner pages:**
  - Videos, with a category filter
  - Team
  - Shows & performances
  - Achievements
- **Proposal request:** a validated form that emails the request (EmailJS) and stores it
  (Firestore), with a "Send on WhatsApp" alternative.
- **Chat assistant:** quick answers to common questions, plus call and WhatsApp shortcuts.
- **Live content:** all copy, videos, team and show formats come from Cloud Firestore, so they
  change without a release.
- **Admin sign-in:** in progress; it comes before content editing.
- **Quality:**
  - WCAG 2.2 AA (axe-checked on every page)
  - pixel-perfect at five breakpoints
  - strict CSP
  - Lighthouse targets of 95 (Performance) and 100 (Accessibility and Best Practices)

## Tech stack

| Concern         | Choice                                                           |
| --------------- | ---------------------------------------------------------------- |
| Framework       | Angular 22: standalone, zoneless, signals for state              |
| Async data flow | RxJS 7                                                           |
| UI              | Bootstrap 5.3 (selective SCSS), design tokens, Bootstrap Icons   |
| Data            | Cloud Firestore (Lite SDK, lazy-loaded) behind a backend port    |
| Email           | EmailJS behind an email port                                     |
| Hosting         | Azure Static Web Apps, deployed by GitHub Actions                |
| Tests           | Vitest (unit, ≥ 90 % coverage), Playwright + axe (e2e, visual)   |
| Quality         | ESLint (angular, typescript, sonarjs, security), Prettier, Sonar |

## Architecture in brief

- **MVVM:** a component renders only what its component-scoped view model exposes. The view
  model combines data streams into signals. Services read data through **ports** (abstract
  classes): `IHttpBackend`, `IEmailService`, `IClipboardService`.
- **Ports and adapters:** a factory picks an adapter per environment (Fake, Firebase, REST), so
  feature code never imports an SDK.
- **Firestore conventions:**
  - Every entity (videos, team, show formats, site config) is stored once and read once per
    visit through a cached shared service.
  - Small content collections are read whole, so a page renders in one pass.

Full rules and diagrams: [CLAUDE.md](CLAUDE.md) and [docs/](docs/README.md), with the
architecture overview, ADRs and the per-feature AIDLC records.

## Getting started

**Prerequisites:**
- **Node.js 24** (see `.nvmrc`) with npm 11.
- **Java 21:** needed only for the Firestore emulator (rules tests and the Firebase smoke suite).

```bash
npm ci
npm run e2e:install      # first time only: Playwright browsers
npm start                # http://localhost:4200
```

Development uses the **Fake backend**, which serves `src/app/core/backends/fake/fake-db.json`,
so no Firebase account is needed.

## Scripts

| Command                         | What it does                                                    |
| ------------------------------- | --------------------------------------------------------------- |
| `npm start`                     | Dev server on port 4200 (Fake backend)                          |
| `npm run build`                 | Production build: budgets and strict CSP                        |
| `npm run verify`                | format check, lint, typecheck, unit tests with coverage, build  |
| `npm test`                      | Unit tests (Vitest)                                             |
| `npm run e2e`                   | Playwright on desktop, tablet and mobile (Fake backend)         |
| `npm run e2e:visual:update`     | Re-record visual baselines after an approved visual change      |
| `npm run test:rules`            | Firestore security rules tests on the emulator (needs Java)     |
| `npm run e2e:firebase`          | Firebase smoke suite on the seeded emulator (needs Java)        |
| `npm run start:emulator`        | Dev server against a running local Firestore emulator           |
| `npm run seed:firestore`        | Copy `fake-db.json` into Firestore (`--dry-run`, `--yes`, `--emulator`) |
| `npm run deploy:rules`          | Deploy `firestore.rules` and indexes                            |

## Configuration

- **Firebase web config** is read at runtime from `public/runtime-config.js`. The file is
  git-ignored; copy `public/runtime-config.example.js` to create it. In CI it is written from
  GitHub secrets (`FIREBASE_*`).
- **EmailJS** service ID, template ID and public key go in `src/environments/environment.ts`.
  When they are empty, the fake email adapter is used.
- **No secrets are committed.** Service account keys stay outside the repository.

## Deployment

Pushes and pull requests to `main` run the GitHub Actions workflow:
1. install dependencies
2. Firestore rules tests (Java 21)
3. production build
4. write `runtime-config.js` from secrets
5. upload to Azure Static Web Apps

Data changes follow a fixed order: deploy the rules, then deploy the app and run the seed. Each
feature's `05-operations.md` records its rollout.

## Project structure

```text
src/app/
  core/        ports (interfaces), adapters (backends), factories, tokens, config
  shared/      base classes, shared components, services, models, utils, styles
  features/    home · videos · team · shows · achievements (lazy-loaded)
e2e/           Playwright specs, page objects, fixtures
tests/rules/   Firestore security rules tests
scripts/       seed and CI config scripts
docs/          architecture, ADRs, AIDLC records
```

## Working on this repository

Changes follow [CLAUDE.md](CLAUDE.md) and the AI-Driven Development Lifecycle in
[docs/aidlc](docs/aidlc/README.md): inception, design, construction, verification and
operations, each approved before the next. Commits use Conventional Commits, and releases follow
Semantic Versioning ([docs/versioning.md](docs/versioning.md)). The history is in
[CHANGELOG.md](CHANGELOG.md).

## Licence

Copyright © 2026 Ravi Akhouri. All rights reserved. Proprietary; see [LICENSE](LICENSE). For
permission requests, contact contact@taalyatra.in.
