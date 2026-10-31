# ADR-0010: App Check deferred

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

## Update — 1.6.0 (2026-10-31)

Still deferred, now by design (0008 D15). The content editor adds admin writes, but they are
protected by Firebase Auth plus `firestore.rules` checking the admin UID and each document's
shape. Enforcing App Check on Firestore would load reCAPTCHA on every public page and cost
Lighthouse points for little gain. App Check will protect the image-upload function in 1.7.0,
which only the admin calls. The proposal-spam exposure above is unchanged.
