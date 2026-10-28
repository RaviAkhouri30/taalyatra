# ADR-0009: Firestore data model and adapter

- **Status:** Accepted · **Date:** 2026-10-28 · **Version:** 1.2.0

## Context

Content moves from the bundled `fake-db.json` to Cloud Firestore (project `taal-yatra`) behind
`IHttpBackend`. Constraints:

- Lighthouse Performance must stay at 95 or above, with initial bundle budgets as hard limits.
- Promises are allowed only in adapters.
- Feature code must not change.
- Firestore document paths need an even number of segments, and documents can't be bare arrays.

## Decision

- **SDK:** `firebase/firestore/lite`, imported only by `core/backends/firebase/firestore-gateway.ts`.
  The adapter loads that module with a dynamic `import()` inside `defer`, once (`shareReplay`).
- **Paths:**
  - Two segments map to a document.
  - One segment maps to a collection, read with `orderBy('order')` and returned as an array with
    `order` removed.
  - List items are numbered by position (`001`, `002`, …).
- **Envelope:** list sections stored in one document use `{ _items: [...] }`. Resume3.0 uses
  `items`, which here collides with real `items` fields in `home/experiences` and `home/faq`.
- **Preloaded collections (added in addendum A):** documents in `site` and `home` are served from
  a single combined read of both collections (`FIRESTORE_PRELOADED_COLLECTIONS`, `forkJoin` +
  `shareReplay`). The chrome and every above-the-fold section then render in one layout pass.
  Separate per-document reads arrived at scattered times and pushed desktop CLS to 0.30–0.61. The
  read cost is the same, since a visit reads all of these documents anyway.
- **Writes:** `post` adds to a collection and stamps `createdAt: serverTimestamp()`. `put`,
  `patch` and `delete` act on documents.
- **Errors:** a path of the wrong shape returns `400`, and missing config returns `503`. Firebase
  error codes map to HTTP statuses through a `ReadonlyMap`. The adapter never throws.
- **Config:** read from `globalThis.__FIREBASE_CONFIG__` (`public/runtime-config.js`, git-ignored,
  written by CI from GitHub secrets). `environment.firebase` overrides it; only the emulator build
  sets that.
- **Seed:** `scripts/seed-firestore.mjs` (`firebase-admin`) syncs `fake-db.json` into `home`,
  `videos`, `gallery` and `team`, and deletes stale documents there. Against a real project it
  needs `--yes`.

## Consequences

- **Deploy order matters.** `firestore.rules` must allow every preloaded collection before the app
  that preloads it goes live. One denied collection fails the whole combined read, and every
  section in it returns 403.

- The initial bundle is unchanged. Firestore costs one lazy chunk plus one REST call per section.
- With one document per list item, a home page visit costs about 43 reads (free tier: 50,000 a
  day).
- Realtime updates and offline cache aren't available. Switching to the full SDK later is
  confined to the gateway.
- `fake-db.json` stays the source of truth until an admin panel exists. Edits made in the console
  are reverted by the next seed.
- Adapter specs mock the SDK module. This is the only place that's allowed (precedent: the EmailJS
  spec). The real SDK is covered by the rules tests and the Firebase smoke e2e suite.
