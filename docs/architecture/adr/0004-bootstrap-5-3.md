# ADR-0004: Bootstrap 5.3.8 instead of Bootstrap 6

- **Status:** Accepted · **Date:** 2026-10-24 · **Version:** 1.0.0

## Context

Bootstrap 6 was requested, but npm shows `latest: 5.3.8` and `next: 6.0.0-alpha.1`.

## Decision

Use the latest stable release, 5.3.8. Import SCSS partials selectively via `src/styles/_bootstrap.scss`.
Use Bootstrap Icons as individual SVGs, not the full font. Sass `@import` deprecation warnings are
silenced in `angular.json` until Bootstrap ships a module-based build.

## Consequences

Re-evaluate once Bootstrap 6 is stable. That migration needs a new ADR and a MAJOR or MINOR bump
depending on visual impact.
