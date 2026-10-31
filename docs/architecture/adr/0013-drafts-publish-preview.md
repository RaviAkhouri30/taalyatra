# ADR-0013: Drafts, atomic publish and preview through a document-store port

- **Status:** Accepted · **Date:** 2026-10-31 · **Version:** 1.6.0

## Context

The owner edits the live site's content (0008). Visitors must never see half-finished work, a
publish must be all or nothing, and the owner must be able to undo a mistake. The public site
reads through `IHttpBackend`, which caches each collection once per visit (ADR-0009, ADR-0011),
so an editor reading through it would see stale data after a publish.

## Decision

- **Port:** `IDocumentStore` (abstract class, also the DI token): `read(path)` and
  `readAll(collection)` always read fresh; `commit(writes)` applies set and delete writes
  atomically (a Firestore `writeBatch`). Adapters: `FirebaseDocumentStore`, `FakeDocumentStore`.
  `IHttpBackend` stays the public site's read path, unchanged.
- **One Firestore connection:** `FirestoreConnection` loads the gateway once for every Firebase
  adapter. Connecting the emulator twice would throw.
- **Drafts:** `drafts/{id}` (the path with `__` for `/`) holds the whole document as it will be
  published, with its path and save time. The format lives in `core/interfaces/i-draft.ts`,
  because the editor writes drafts and preview mode reads them.
- **Publish:** one commit sets every drafted document live, writes `publishes/{id}` (a sortable
  timestamp) with each document's previous version, deletes the drafts and trims the history to 20. **Undo** copies a record's previous versions back into drafts, so they go through the same
  checks and confirmation.
- **Preview:** `?preview` (read once at startup into `APP_PREVIEW`) makes the backend factory wrap
  the adapter in `DraftOverlayBackend`. It answers drafted documents from the drafts, and only
  after Auth confirms a session; anyone else, or a failed read, gets live content. Public visits
  never load Auth.
- **Rules:** `drafts` and `publishes` are readable and writable by the admin UID only.

## Consequences

- The editor shows exactly what is stored, and a failed publish changes nothing.
- A publish appears on visitors' next page load, not on pages already open.
- Drafts and history roughly double the stored content: far below the free quota, and never
  read by public pages.
- The Fake backend needed state: `FakeDataStore` (`fake-db.json` plus writes kept in
  `localStorage`), shared by `FakeHttpsService` and `FakeDocumentStore`. The fake sign-in
  persists too, so preview works in development and e2e.
