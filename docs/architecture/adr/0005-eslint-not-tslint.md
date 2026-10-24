# ADR-0005: ESLint + SonarQube instead of TSLint

- **Status:** Accepted · **Date:** 2026-10-24 · **Version:** 1.0.0

## Context

TSLint was requested, but it has been deprecated and unmaintained since 2019. Angular removed
support for it.

## Decision

Use ESLint 10 flat config with `typescript-eslint` (strict + stylistic type-checked), `angular-eslint`
(TS, templates, a11y), `eslint-plugin-sonarjs` and `eslint-plugin-security`, plus SonarQube for the
quality gate. Project rules (300 lines, the Promise ban, complexity) are encoded in `eslint.config.mjs`.

## Consequences

Every former TSLint rule has a typescript-eslint equivalent. The editor gives feedback through the ESLint
and SonarLint VS Code extensions.
