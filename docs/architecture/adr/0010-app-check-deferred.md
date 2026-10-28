# ADR-0010: App Check deferred to 1.3.0

- **Status:** Accepted · **Date:** 2026-10-28 · **Version:** 1.2.0

## Context

CLAUDE.md §10 requires Firebase App Check. It needs a reCAPTCHA Enterprise site key and a
registered app, and neither exists yet. Release 1.2.0 opens one write path: visitors can create
`proposals`.

## Decision

Ship 1.2.0 without App Check. The exposure is limited by rules:

- content is read-only
- `proposals` is create-only, with an exact key set, type and length checks, and
  `createdAt == request.time`
- everything else is denied

## Consequences

- A scripted client could create junk proposals within the validation limits. Firestore's
  per-project quotas cap the cost, and the records can be found by `createdAt` and removed.
- **Follow-up (1.3.0):** register a reCAPTCHA Enterprise key, initialise App Check in the
  gateway, and enforce it in the console. This rule exception ends then.
