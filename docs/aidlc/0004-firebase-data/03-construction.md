# 03 · Construction — Firebase data

Built in small increments from the approved [design](02-design.md). Each increment was linted,
typechecked and unit-tested before the next one started.

| #   | Increment                       | Files                                                                                                                                                                                                                         | Tests                                                             |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Dev dependencies                | `package.json`: `firebase-admin` 14.5.0, `firebase-tools` 15.34.1, `@firebase/rules-unit-testing` 6.0.0 (exact)                                                                                                              | `npm audit`: 5 moderate, 0 high or critical                       |
| 2   | Config plumbing                 | `BackendType.Firebase`, `i-firebase-config.ts`, `IAppEnvironment` (+`firebase`, `firestoreEmulator`), `environment.emulator.ts`, `runtime-firebase-config.ts`, `FIREBASE_CONFIG`; production now uses `Firebase`               | unit                                                              |
| 3   | Firestore adapter               | `core/backends/firebase/*`: path, envelope, error status, gateway (lazy chunk), `FIRESTORE_GATEWAY_LOADER`, `FirebaseBackendService`; factory case                                                                             | unit                                                              |
| 4   | Command path and proposals      | `HttpsErrorHandler.handleCommand`, `ApiWriteBaseService`, `ApiEndpoint.Proposals`, `ProposalsService`, `PROPOSAL_MAX_LENGTH`, form validators and `maxlength`, `HomeContactViewModel` (parallel channels)                      | unit (contact component spec: both, either and neither channel)  |
| 5   | Firebase project and rules      | `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `tests/rules/firestore.rules.spec.ts`, `vitest.rules.config.ts`, `tsconfig.rules.json`                                                            | rules spec written; **not run yet** (needs Java)                  |
| 6   | Scripts                         | `scripts/seed-firestore.mjs`, `scripts/write-runtime-config.mjs`                                                                                                                                                              | plan and config writer checked by hand (below)                    |
| 7   | Wiring                          | `index.html` (config script, preconnect), `public/runtime-config.example.js`, `public/staticwebapp.config.json`, `angular.json` (`emulator` configuration, lint patterns, assets ignore), npm scripts, CI workflow           | production build                                                  |
| 8   | Firebase smoke suite            | `playwright.firebase.config.ts`, `e2e/specs/firebase-smoke.e2e.ts`; main config ignores it                                                                                                                                    | written; **not run yet** (needs Java)                             |
| 9   | Docs                            | ADR-0009, ADR-0010, `backend-adapter-example.md`, architecture docs, CLAUDE.md §2/§3                                                                                                                                         | —                                                                 |

## Checks run during construction

- **`npm run verify`:** passes. 92 test files and 346 tests. Coverage: statements 99.76 %,
  branches 98.91 %, functions 99.61 %, lines 100 %.
- **Production bundle:** initial total 462.29 kB raw, 106.87 kB transfer (budget warning at
  500 kB). The Firestore SDK is the lazy `firestore-gateway` chunk, 131.67 kB raw and 36.02 kB
  transfer. `firestore.googleapis` and `initializeApp` appear in no initial chunk.
- **autoCsp:** `runtime-config.js` and `main` are both inserted by hashed loaders with
  `async = false`, so they run in order under `'strict-dynamic'`. A browser load showed 0 CSP
  violations.
- **Real project (`taal-yatra`, not yet seeded, console rules deny-all):** the production build
  loaded the runtime config, made 24 Firestore requests (21 sections plus 3 lists), and each got
  `403`. Each became a non-2xx response that `HttpsErrorHandler` logged, and nothing crashed.
- **Seed plan:** 43 documents (21 `home/*`, 9 + 7 + 6 list items).
  - `home/marquee` is wrapped as `{ _items }`.
  - `home/experiences` keeps its real `items` field.
  - `team/006` gets `order: 5`.
  - An unknown top-level key is rejected.
- **Config writer:** escapes values with `JSON.stringify` and exits 1 when any variable is missing.
- **`npm run e2e` (Fake):** 106 passed, 2 failed. The failures were `#top` and `#diwali`
  screenshots on mobile, captured stitched with the fixed header and action bar on top. Re-run
  alone (`home-visual --project=mobile --repeat-each=2`), all 32 pass: a flaky capture under full
  parallel load, not a regression. No markup or styles in those sections changed.

## Seeding the real project (2026-10-28)

- **Dry run:** `npm run seed:firestore -- <key> --dry-run` showed project `taal-yatra`, 43
  documents to write, 0 to delete.
- **Write:** `--yes` reported "Seeded taal-yatra."
- **Read back with the Admin SDK:**
  - `home` 21, `videos` 9, `gallery` 7, `team` 6, `proposals` 0
  - `home/marquee` is wrapped in `_items`, and `videos/001` has `order: 0`
- **Database:** `FIRESTORE_NATIVE`, location `asia-south2`.
- **Rules deployed by the owner.** Anonymous REST reads: `home/hero` and `videos/001` return
  `200`; listing `proposals` returns `403`.
- **Production build against the live database:**
  - 24 Firestore requests, all `200`
  - hero heading "Find your rhythm. Share the beat." and the trust cards render
  - 4 videos, 7 gallery tiles, 4 team members, 16 sections
  - 0 console errors

## Decisions & deviations from design

- **The gateway loader is injected through a token, `FIRESTORE_GATEWAY_LOADER`.** The design had
  the adapter call `import()` directly. The Angular unit-test builder refuses `vi.mock` for
  relative imports and asks for TestBed instead, so the dynamic import moved into the token's
  default factory and the adapter spec provides a fake gateway through DI. The token lives in
  `core/backends/firebase`, not `core/tokens`, because the dynamic import must stay inside
  `core/backends`. A small `IFirestoreGateway` interface types the seam.
- **Gateway methods return Observables**, not Promises, so `.then` never appears even inside the
  adapter.
- **No unreachable config check.** When the config is missing, `gateway$` itself is `null`, and
  `request()` answers `503`.
- **`ApiWriteBaseService` declares `abstract create(body: B)`.** That keeps the type parameter
  meaningful (lint: `no-unnecessary-type-parameters`) and mirrors `ApiBaseService`.
- **Logging:** a failed store is logged by `HttpsErrorHandler.handleCommand`, and a failed email by
  the view model ("Proposal email failed"). Each failure is logged once.
- **`maxlength` uses `[attr.maxlength]`** rather than the `maxlength` directive, so validation stays
  only in the form class (`Validators.maxLength`).
- **One shared SDK mock** (`core/backends/firebase/testing/firebase-sdk.mock.ts`). The coverage run
  shares modules between spec files, so two different mocks of `firebase/firestore/lite` clashed.
- **Rules tests use plain `expect`** (`rejects.toMatchObject({ code: 'permission-denied' })`)
  instead of `assertFails` and `assertSucceeds`, because the sonarjs rule doesn't count those as
  assertions.
- **ESLint for `scripts/`:** `process` and `console` are declared as globals inline, rather than
  adding the `globals` package as a direct dependency.
- **`fake-db.json` still ships as a lazy chunk in production.** The factory references every
  adapter. This is unchanged from 1.1.0, and the chunk is never fetched when the backend is
  Firebase.
- **Java:** Homebrew isn't installed, and a direct JDK download was blocked by the session's
  permission policy. `test:rules` and `e2e:firebase` wait until Java is available locally; CI
  installs Temurin 21.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28
