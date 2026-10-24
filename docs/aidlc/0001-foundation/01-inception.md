# 01 · Inception — Foundation (rules, architecture, tooling)

## Goal

Set up the rules, architecture and tooling that every future Taal Yatra feature must follow.

## Requirements (from the product owner)

MVVM (Component → ViewModel → Service) · strict SOLID and OOP · standalone · Angular best practices
and clean architecture · ≤ 300 lines per file · full documentation (class, flow, sequence diagrams) via
AIDLC · TSDoc comments · ESLint + SonarQube + security · RxJS only (Promises only in tests) · ≥ 90 %
unit coverage · Playwright e2e · Firebase behind an `IHttpBackend`-style adapter chosen by a factory ·
pixel-perfect, fast UI · injection tokens · many small components · SemVer starting at 1.0.0, bumped
on each feature.

## Acceptance criteria

- [x] `CLAUDE.md` captures every rule.
- [x] `docs/` holds the architecture diagrams, ADRs and the AIDLC template.
- [x] Packages and tooling are installed and pinned. `npm run verify` and `npm run e2e` pass.
- [x] Lint actually enforces the 300-line limit and the Promise ban.
- [x] `package.json` version is 1.0.0, with a CHANGELOG.

## Risks / open questions

- Bootstrap 6 is alpha only, so 5.3.8 is used (ADR-0004).
- TSLint is deprecated, so ESLint is used (ADR-0005).
- The canonical backend-adapter example from the product owner is still pending.

---

**Approval:** ☑ Requirements given by product owner on 2026-10-24
