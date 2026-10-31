# 01 · Inception — Firebase data

## Problem / goal

Every section of the site reads its copy from `fake-db.json`, which ships inside the bundle. To
change a price, a video or a team bio, someone has to edit code and redeploy. Proposal requests
exist only as emails.

Move all site content into **Cloud Firestore** in the existing Firebase project, behind the
`IHttpBackend` port, so production reads live data and feature code stays the same. Each proposal
request is also saved to Firestore as a record that can't be changed afterwards. `fake-db.json`
stays as the source for development, unit tests and the deterministic e2e suite, and as the seed
for Firestore.

## User stories

- As the **business**, I want site copy, videos, gallery photos and team profiles stored in
  Firestore, so that content can change without a code release (and a future admin panel has
  something to edit).
- As the **business**, I want every proposal request stored, so that no lead is lost when an
  email goes missing or lands in spam.
- As a **visitor**, I want the site to load as fast as it does today, so that moving to a live
  database costs me nothing.
- As a **developer**, I want one command that copies `fake-db.json` into Firestore (or the local
  emulator), so that the database never drifts from the data the tests use.
- As a **developer**, I want development and e2e runs to keep using the fake backend, so that they
  stay offline and deterministic.
- As the **owner**, I want the database locked down by default, so that visitors can read public
  content and create proposals, and nothing else.

## Acceptance criteria

- [ ] Given the production build, when the home page loads, then every section renders from
      Firestore with content identical to today's `fake-db.json`.
- [ ] Given `backend: BackendType.Firebase`, when any endpoint is read, then the response honours
      the `IHttpBackend` contract: `200` with a body, `404` when the document is missing, and
      non-2xx (never a thrown error) for permission, network or timeout failures.
- [ ] Given the lists `videos`, `gallery` and `team`, when read, then each item is its own
      document, returned in its `order` field's order, without the `order` field in the body.
- [ ] Given `home/marquee` and `home/trust` (lists stored as one document), when read, then the
      body is the original list.
- [ ] Given a valid proposal, when it is submitted, then it is emailed (as today) **and** saved to
      `proposals` with a server timestamp.
- [ ] Given `firestore.rules`, when tested on the emulator, then public content can be read but
      not written, a well-formed proposal can be created, a malformed or oversized one is rejected,
      proposals can't be read, updated or deleted, and any other path is denied.
- [ ] Given `npm run seed:firestore -- <service-account.json>`, when run, then every section and
      list item lands in Firestore. Running it twice gives the same result, and list items removed
      from `fake-db.json` are deleted. With `--emulator` it targets the local emulator and needs no
      credentials.
- [ ] Given the production bundle, when measured, then the initial bundle stays within the
      `angular.json` budgets: the Firestore SDK loads lazily, on the first data request.
- [ ] Given the Firebase web config, when the app is deployed, then it comes from
      `runtime-config.js`, which the CI pipeline writes from GitHub secrets. Nothing is committed.
- [ ] Given development, unit tests and the main e2e suite, when run, then they still use the fake
      backend, and a separate Firebase smoke suite passes against the seeded emulator.
- [ ] `npm run verify` and `npm run e2e` pass, coverage stays ≥ 90 %, and Lighthouse targets hold.

## Units of work

1. **Config plumbing**: `BackendType.Firebase`, a `FIREBASE_CONFIG` token read from
   `globalThis.__FIREBASE_CONFIG__` (`public/runtime-config.js`, git-ignored, plus a committed
   `runtime-config.example.js`), a script tag in `index.html`, and `provideFirebase()`.
2. **`FirebaseBackendService`** (`core/backends/firebase`): maps paths with two segments to
   documents and paths with one segment to collections sorted by `order`. It unwraps
   `{ items: [...] }`, wraps SDK Promises with `defer`, loads the SDK lazily, and turns Firebase
   error codes into HTTP statuses (`permission-denied` → 403, `not-found` → 404,
   `unavailable` → 503). `post` maps to `addDoc` and returns `201`.
3. **Factory and environments**: a `Firebase` case in `httpBackendFactory`. Production switches to
   Firebase; development stays on Fake.
4. **Proposal storage**: a `ProposalsService` that writes to `ApiEndpoint.Proposals` through a new
   write method on `ApiBaseService`. `HomeContactViewModel` sends the email and saves the record.
   The design phase decides how a partial failure is handled.
5. **Security rules**: `firebase.json`, `firestore.rules` (deny by default, public read on content
   collections, create-only `proposals` with type, length and key validation),
   `firestore.indexes.json`, and rules unit tests (`npm run test:rules`) on the emulator.
6. **Seed script**: `scripts/seed-firestore.mjs` (`firebase-admin`) with `--emulator` and
   `--dry-run`. It uses batched, idempotent writes, deletes stale list items, and never prints
   credentials.
7. **CI and deploy**: a workflow step that writes `runtime-config.js` into the build output from
   GitHub secrets, plus a no-cache header for that file in `staticwebapp.config.json`.
8. **E2E**: the main suite stays on Fake. Add `e2e/specs/firebase-smoke.e2e.ts` against the seeded
   emulator, on desktop, tablet and mobile.
9. **Docs**: ADR-0009 (Firestore data model and lazy Firestore Lite SDK), ADR-0010 (App Check
   deferred), `docs/architecture/backend-adapter-example.md`, and updates to overview, class,
   sequence, data-model and deployment diagrams.
10. **Release**: 1.2.0 (MINOR), with a CHANGELOG entry and `05-operations.md`.

### New dependencies (all dev, `--save-exact`)

| Package                        | Why                                                                  |
| ------------------------------ | -------------------------------------------------------------------- |
| `firebase-admin`               | Seed script: writes with a service account, bypassing client rules   |
| `firebase-tools`               | Firestore emulator for rules tests and the smoke suite; rules deploy |
| `@firebase/rules-unit-testing` | Asserts `firestore.rules` allow/deny behaviour on the emulator       |

`firebase` 13.1.0 is already a runtime dependency. No new runtime dependency is added.

## Risks & open questions

- **Project ID (resolved).** The project is `taal-yatra`. It goes in `.firebaserc`. The API key and
  other web config go only in the git-ignored `public/runtime-config.js` (already created locally)
  and the GitHub secrets. Firebase Hosting and Analytics are **not** used: the site stays on Azure
  Static Web Apps, and Analytics would add bundle weight, a consent requirement and CSP changes.
- **Java isn't installed on this machine.** The Firestore emulator needs a JDK (11 or later). Rules
  tests and the smoke suite can't run locally until one is installed (`brew install openjdk@21`).
  CI runners already have Java.
- **Bundle size.** The full Firestore SDK would add roughly 250 kB or more. Mitigation: use
  `firebase/firestore/lite` (REST, no realtime or offline cache, which a content site doesn't need)
  and load it with a dynamic import inside the adapter, the same way `fake-db.json` loads today.
- **Read volume.** With one document per list item, a home page visit costs about 43 document
  reads instead of about 24. The free tier is 50,000 reads a day, about 1,100 home page visits.
  Paid reads cost cents per 100,000. That's acceptable for now; revisit if traffic grows (for
  example, cache in the browser, or move lists into one document each).
- **Partial proposal failure (resolved).** The visitor sees success if **either** the email or the
  save succeeds, and the failed one is logged.
- **Spam.** Without App Check, the create-only `proposals` rule is protected only by validation.
  App Check is deferred by your choice (ADR-0010) and should follow in the next release.
- **Seed overwrites console edits.** The seed treats `fake-db.json` as the source of truth. Anyone
  who edits content in the Firebase console must also update the JSON, or the next seed reverts the
  edit. This lasts until an admin panel exists.
- **CSP.** `autoCsp` only governs `script-src`, so Firestore's `fetch` calls are unaffected. Still
  to check: the external `runtime-config.js` tag works under the strict CSP in production.
- **Canonical adapter example (resolved).** The Resume3.0 `FirebaseBackendService` is the example,
  ported to the stricter rules here. It's saved in `docs/architecture/backend-adapter-example.md`.
- **Firestore database:** created in Native mode, location `asia-south2` (recorded in
  `docs/architecture/deployment.md`).

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28

---

## Addendum A: site config and real email (2026-10-28)

Raised after Construction, when the owner checked the console and expected all site data in
Firestore.

**Goal.** Move the remaining business content, still hardcoded in `site.constants.ts`, into
Firestore: brand, contact details, social links, promotion and copyright year. Then the phone,
address or offer can change without a release. Turn on real EmailJS delivery for proposals,
alongside the Firestore record.

**Out of scope.** Navigation menus stay in code, because they point at app routes and enums.
Design constants (diya colours, spark counts, icon registry) stay too: they're styling, not
content.

**Acceptance criteria**

- [ ] Given the production build, when any page loads, then the utility bar, header, footer,
      promo badge, mobile action bar, WhatsApp button and the sections that show contact details
      render from `site/config` in Firestore, with today's content.
- [ ] Given seven view models that need site config, when a page loads, then Firestore is read
      **once** per visit (cached).
- [ ] Given `site/config`, when the rules are tested, then anyone can read it and no client can
      write it.
- [ ] Given the WhatsApp link, when the phone number changes in Firestore, then the link follows
      it (derived, not stored twice).
- [ ] Given the change, when CLS is measured on the production build against the live database,
      then it stays below 0.1.
- [ ] Given the EmailJS service ID, template ID and public key, when a valid proposal is
      submitted in production, then a real email is sent and the record is stored.

**Units of work.** A1 site-config DTO, model and endpoint · A2 cached `SiteConfigService` on
`ApiBaseService` · A3 data moved into `fake-db.json`, hardcoded copy removed · A4 seed, rules and
rules tests · A5 specs (path-aware backend stub) · A6 CLS measurement · A7 EmailJS IDs in
`environment.ts` (ADR-0006), once the owner provides them.

**Risks.**

- The chrome now waits on a network read. The page already depends on Firestore, so an outage
  hides it along with the hero; no bundled fallback is kept, because a fallback copy would drift.
- The header appearing late could shift content (CLS). This is measured in A6 and mitigated if it
  reaches 0.1 or more.

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28 (in chat: "i approve these suggestions")
