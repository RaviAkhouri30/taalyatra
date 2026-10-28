# 02 · Design — Firebase data

Builds on the approved [inception](01-inception.md). The canonical adapter is the Resume3.0
`FirebaseBackendService`, saved with porting notes in
[backend-adapter-example.md](../../architecture/backend-adapter-example.md). The decisions are
recorded in [ADR-0009](../../architecture/adr/0009-firestore-data-adapter.md) and
[ADR-0010](../../architecture/adr/0010-app-check-deferred.md).

## Key decisions

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Firestore Lite** (`firebase/firestore/lite`) instead of the full SDK. It uses REST, with no realtime listeners or offline cache, which a content site doesn't need, and is a fraction of the size.                                                                                                                                                                                  |
| D2  | **The SDK loads lazily.** Everything that imports `firebase/*` lives in one module, `firestore-gateway.ts`, which the adapter loads with `defer(() => import(...))` on the first request and then caches (`shareReplay`). The initial bundle doesn't grow.                                                                                                                            |
| D3  | **Paths map to Firestore by segment count.** Two segments (`home/hero`) is a document. One segment (`videos`) is a collection, read sorted by `order` and returned as an array.                                                                                                                                                                                                       |
| D4  | **List sections stored as one document use a reserved envelope key, `{ _items: [...] }`, not `items`.** `home/experiences` and `home/faq` already hold an `items` array next to other fields, so Resume3.0's rule ("unwrap any `items` array") would cut those two sections down to their list.                                                                                     |
| D5  | **List item documents are numbered by position** (`videos/001`, `002`, …) and carry an `order` field. The adapter removes `order` from the body. Names can't serve as IDs because the content is still placeholders (six team members are named `[NAME]`).                                                                                                                         |
| D6  | **The adapter adds `createdAt` with `serverTimestamp()` on every `post`.** Feature code never touches an SDK type, and the rules require `createdAt == request.time`, so clients can't backdate a record.                                                                                                                                                                             |
| D7  | **Errors become responses, never thrown errors** (Liskov). Firebase error codes map to HTTP statuses through a `ReadonlyMap`, with no `switch` (Open/Closed). A path with the wrong shape for the operation returns `400`, and missing config returns `503`.                                                                                                                         |
| D8  | **Config comes from `runtime-config.js`.** It sets `globalThis.__FIREBASE_CONFIG__` and is loaded by a classic `<script>` in `index.html` before the app bundle. A build-time `environment.firebase` overrides it; only the emulator build uses that.                                                                                                                                 |
| D9  | **Proposals: both channels run in parallel, and the visitor sees success if either works** (your decision). Each channel turns its own failure into `false`, so one failure can't cancel the other (`forkJoin`). Each failure is logged once.                                                                                                                                        |
| D10 | **Commands get their own error path.** `HttpsErrorHandler.handle()` swallows failures, which suits views. A new `handleCommand()` logs the failure and **rethrows**, so the view model knows the save failed. Writes go through a new base class, `ApiWriteBaseService`, so a service that only writes isn't forced to implement `attachViewDataHandler` (interface segregation). |
| D11 | **Client and rules enforce the same limits.** Max lengths live in `PROPOSAL_MAX_LENGTH`, which drives both the form's `Validators.maxLength` and `maxlength` attributes. The rules tests build payloads from the same constant (at the limit and one over), so the two can't drift apart unnoticed.                                                                                |
| D12 | **Development, unit tests and the main e2e suite stay on Fake.** A new `emulator` build configuration points at the local emulator (project `demo-taal-yatra`) for the Firebase smoke suite. The `demo-` prefix means it can never reach real resources.                                                                                                                            |

## Component tree

No visual change. The only template change is `maxlength` attributes on the proposal form.

```mermaid
flowchart TD
  Contact["app-home-contact<br/>(HomeContactViewModel)"] --> PF["app-proposal-form<br/>+ maxlength from PROPOSAL_MAX_LENGTH"]
  Contact --> CA[app-contact-aside]
```

## Class diagram

```mermaid
classDiagram
  direction LR
  class IHttpBackend { <<abstract port>> }
  class FirebaseBackendService {
    -gateway$: Observable~FirestoreGateway~
    +get~T~(path) Observable~HttpResponse~T~~
    +post~T~(path, body) Observable~HttpResponse~T~~
    +put~T~(path, body) Observable~HttpResponse~T~~
    +patch~T~(path, body) Observable~HttpResponse~T~~
    +delete~T~(path) Observable~HttpResponse~T~~
    -request~T~(path, kind, call, status) Observable~HttpResponse~T~~
  }
  class FirestoreGateway {
    <<lazy chunk · only firebase/* importer>>
    -db: Firestore
    +getDocument(segments) Promise~unknown~
    +listCollection(segments) Promise~unknown[]~
    +addDocument(segments, body) Promise~string~
    +setDocument(segments, body) Promise~void~
    +updateDocument(segments, body) Promise~void~
    +deleteDocument(segments) Promise~void~
  }
  class FirestorePath {
    +segments: readonly string[]
    +kind: Document | Collection
    +parse(path)$ FirestorePath | null
  }
  class FirestoreEnvelope {
    +unwrap(data)$ unknown
    +stripOrder(data)$ unknown
  }
  class firestoreErrorStatus { <<function>> +toStatus(error) HttpStatusCode }
  class FIREBASE_CONFIG { <<InjectionToken~IFirebaseConfig | null~>> }
  class HttpsErrorHandler {
    +handle~T~(req) Observable~HttpResponse~T~~
    +handleCommand~T~(req) Observable~HttpResponse~T~~
  }
  class ApiWriteBaseService~B~ {
    <<abstract>>
    #attachCreateApiHandler(endpoint, body: B) Observable~void~
  }
  class ProposalsService { +create(value: ProposalValue) Observable~void~ }
  class HomeContactViewModel {
    -send(model) Observable~ProposalStatus~
    -deliver(channel$, name) Observable~boolean~
  }

  IHttpBackend <|.. FirebaseBackendService
  FirebaseBackendService ..> FirestoreGateway : import() once
  FirebaseBackendService ..> FirestorePath
  FirebaseBackendService ..> firestoreErrorStatus
  FirebaseBackendService --> FIREBASE_CONFIG : inject
  FirestoreGateway ..> FirestoreEnvelope
  ApiWriteBaseService <|-- ProposalsService
  ApiWriteBaseService --> HttpsErrorHandler
  ApiWriteBaseService --> IHttpBackend
  HomeContactViewModel --> ProposalsService
  HomeContactViewModel --> IEmailService
```

`httpBackendFactory` gains `case BackendType.Firebase: return new FirebaseBackendService();`.

## Sequence diagrams

### Reading a section (first request loads the SDK)

```mermaid
sequenceDiagram
  autonumber
  participant S as HomeHeroService
  participant EH as HttpsErrorHandler
  participant A as FirebaseBackendService
  participant G as FirestoreGateway (lazy)
  participant FS as Firestore (REST)

  S->>EH: handle(backend.get('home/hero'))
  EH->>A: subscribe (timeout, loader)
  A->>A: FirestorePath.parse → Document [home, hero]
  alt first request
    A->>G: defer(() => import('./firestore-gateway')) · shareReplay
    G->>G: initializeApp(config) · getFirestore · emulator?
  end
  A->>G: defer(() => getDocument([home, hero]))
  G->>FS: GET documents/home/hero
  FS-->>G: fields
  G-->>A: unwrap {_items} if present · undefined if missing
  A-->>EH: HttpResponse 200 (body) · 404 (missing)
  Note over A: FirebaseError → toStatus(code) → HttpResponse 403/503/… (never throws)
  EH-->>S: body (non-2xx: logged, completes empty)
```

### Reading a list

```mermaid
sequenceDiagram
  autonumber
  participant A as FirebaseBackendService
  participant G as FirestoreGateway
  participant FS as Firestore
  A->>A: parse('videos') → Collection [videos]
  A->>G: listCollection([videos])
  G->>FS: runQuery videos orderBy(order)
  FS-->>G: 9 docs
  G-->>A: docs.map(stripOrder) → IVideoDto[]
  A-->>A: HttpResponse 200 ([] when empty, a valid empty result)
```

### Submitting a proposal

```mermaid
sequenceDiagram
  autonumber
  participant VM as HomeContactViewModel
  participant E as IEmailService
  participant PS as ProposalsService
  participant EH as HttpsErrorHandler
  participant A as IHttpBackend
  VM->>VM: valid? (incl. maxLength) · exhaustMap
  VM->>VM: status = sending
  par email
    VM->>E: send(message) → true · error → log, false
  and record
    VM->>PS: create(value)
    PS->>EH: handleCommand(backend.post('proposals', value))
    EH->>A: post → addDoc {…value, createdAt: serverTimestamp()}
    A-->>EH: 201 {id, …value}
    EH-->>PS: ok (non-2xx → log, rethrow)
    PS-->>VM: void → true · error → false
  end
  VM->>VM: forkJoin → any true ? sent (reset form) : failed
```

### Seeding

```mermaid
sequenceDiagram
  autonumber
  actor Dev
  participant Seed as seed-firestore.mjs
  participant FS as Firestore / emulator
  Dev->>Seed: npm run seed:firestore -- key.json [--yes] | --emulator | --dry-run
  Seed->>Seed: read fake-db.json → plan: set home/*, set videos|gallery|team/NNN
  Seed->>FS: list ids in home, videos, gallery, team
  Seed->>Seed: delete ids no longer in the plan (never touches proposals)
  alt --dry-run, or a real project without --yes
    Seed-->>Dev: print plan (paths, counts), write nothing
  else
    Seed->>FS: batched set/delete (≤ 500 per batch)
    Seed-->>Dev: "Seeded <project>: N set, M deleted"
  end
```

### Runtime config at deploy

```mermaid
sequenceDiagram
  autonumber
  participant GH as GitHub Actions
  participant W as write-runtime-config.mjs
  participant SWA as Azure Static Web Apps
  participant B as Browser
  GH->>GH: npm ci · test:rules (emulator) · build
  GH->>W: FIREBASE_* secrets as env
  W->>W: every key present? else fail the build
  W-->>GH: dist/…/runtime-config.js
  GH->>SWA: upload (runtime-config.js served no-cache)
  B->>SWA: index.html → runtime-config.js (classic script) → main.js
```

## Request flow inside the adapter

```mermaid
flowchart TD
  R[get/post/put/patch/delete path] --> P{FirestorePath.parse}
  P -- invalid --> E400[400 Bad Request]
  P --> K{kind fits the operation?<br/>get: either · post: Collection<br/>put/patch/delete: Document}
  K -- no --> E400
  K -- yes --> C{config present?}
  C -- no --> E503[503 + logged]
  C -- yes --> G[gateway$ → SDK call in defer]
  G -- ok --> OK[200 / 201 / 204]
  G -- missing doc --> E404[404]
  G -- FirebaseError --> M[toStatus code → 401/403/400/409/429/503/504/500]
```

| Firebase code                               | Status |
| ------------------------------------------- | ------ |
| `unauthenticated`                           | 401    |
| `permission-denied`                         | 403    |
| `not-found`                                 | 404    |
| `already-exists`                            | 409    |
| `invalid-argument`, `failed-precondition`   | 400    |
| `resource-exhausted`                        | 429    |
| `unavailable`                               | 503    |
| `deadline-exceeded`                         | 504    |
| anything else, or not a Firebase error      | 500    |

## Data model

| Firestore path                   | Content                                    | Source in `fake-db.json` |
| -------------------------------- | ------------------------------------------ | ------------------------ |
| `home/{section}` (21 docs)       | the section DTO as stored                  | `home.<section>`         |
| `home/marquee`, `home/trust`     | `{ _items: [...] }` (lists in one doc)     | `home.marquee/trust`     |
| `videos/{001…}` (9)              | `IVideoDto` + `order`                      | `videos[]`               |
| `gallery/{001…}` (7)             | `IImageDto` + `order`                      | `gallery[]`              |
| `team/{001…}` (6)                | `ITeamMemberDto` + `order`                 | `team[]`                 |
| `proposals/{autoId}`             | proposal (below), create-only              | written by visitors      |

**Proposal document:** `need`, `eventType`, `experience`, `groupSize`, `date` (string, at most
100 characters); `name` (1 to 100); `phone` (1 to 20); `email` (at most 254); `message` (at most
2,000); `createdAt` (timestamp, equal to `request.time`). The keys must be exactly these 10.

### Rules matrix (`firestore.rules`, deny by default)

| Path                                  | read (get/list) | create              | update / delete |
| ------------------------------------- | --------------- | ------------------- | --------------- |
| `home/*`, `videos/*`, `gallery/*`, `team/*` | ✅ anyone       | ❌                  | ❌              |
| `proposals/*`                         | ❌              | ✅ if valid (above) | ❌              |
| anything else                         | ❌              | ❌                  | ❌              |

`firestore.indexes.json` is empty: `orderBy('order')` on one field uses the automatic index.

## Configuration

| Setting (`IAppEnvironment`) | production | development | emulator (new)                              |
| --------------------------- | ---------- | ----------- | ------------------------------------------- |
| `backend`                   | `Firebase` | `Fake`      | `Firebase`                                  |
| `firebase` (new)            | `null` → runtime-config.js | `null` | demo config, project `demo-taal-yatra` |
| `firestoreEmulator` (new)   | `null`     | `null`      | `{ host: '127.0.0.1', port: 8080 }`         |

`index.html` adds `<script src="runtime-config.js"></script>` and
`<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin>`. When the file is
missing in development, the browser logs a harmless 404. The Fake backend doesn't need the file.

## Files

**New**

| File | Purpose |
| --- | --- |
| `core/backends/firebase/firebase-backend.service.ts` | `IHttpBackend` adapter (D3, D6, D7) |
| `core/backends/firebase/firestore-gateway.ts` | the lazy chunk: the only `firebase/*` importer (D1, D2) |
| `core/backends/firebase/firestore-path.ts` | parses and validates paths, decides document or collection |
| `core/backends/firebase/firestore-envelope.ts` | `_items` unwrap, `order` strip (D4, D5) |
| `core/backends/firebase/firestore-error-status.ts` | code-to-status map (D7) |
| `core/backends/firebase/firestore.constants.ts` | `_items`, `order`, `createdAt` |
| `core/interfaces/i-firebase-config.ts` | our own config shape, so no SDK type leaks |
| `core/tokens/firebase-config.token.ts` | `FIREBASE_CONFIG` (D8) |
| `core/config/runtime-firebase-config.ts` | reads and type-guards `globalThis.__FIREBASE_CONFIG__` |
| `shared/base/api-write-base.service.ts` | write base class (D10) |
| `features/home/sections/contact/proposals.service.ts` | `create(value)` → `ApiEndpoint.Proposals` |
| `features/home/sections/contact/proposal-limits.constants.ts` | `PROPOSAL_MAX_LENGTH` (D11) |
| `environments/environment.emulator.ts` | emulator build (D12) |
| `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json` | Firebase project and rules |
| `tests/rules/firestore.rules.spec.ts`, `vitest.rules.config.ts`, `tsconfig.rules.json` | rules tests |
| `scripts/seed-firestore.mjs`, `scripts/write-runtime-config.mjs` | seeding and CI config |
| `public/runtime-config.example.js`, `public/staticwebapp.config.json` | config template, no-cache header |
| `playwright.firebase.config.ts`, `e2e/specs/firebase-smoke.e2e.ts` | smoke suite |

All of these have a co-located `.spec.ts` where CLAUDE.md §9 requires one.

**Changed:** `backend-type.enum.ts` (+`Firebase`), `http-backend.factory.ts`,
`i-app-environment.ts`, both environments, `https-error-handler.service.ts` (+`handleCommand`),
`api-endpoint.enum.ts` (+`Proposals`), `proposal-form.ts` and its template (max lengths),
`home-contact.view-model.ts` (D9), `index.html`, `angular.json` (`emulator` configuration),
`playwright.config.ts` (ignore `firebase-*.e2e.ts`), `package.json` (scripts and dev
dependencies), `eslint.config.mjs` (Node globals for `scripts/`), the CI workflow, CLAUDE.md §2
(new commands), and the architecture docs (overview, class, sequence, data model, deployment).

**New npm scripts:** `seed:firestore`, `test:rules`, `start:emulator`, `e2e:firebase`,
`deploy:rules` (`firebase deploy --only firestore:rules,firestore:indexes`).

## Test plan

- **Unit (Vitest):**
  - **Path:** documents, collections, invalid paths.
  - **Error status:** every code in the table, plus unknown values.
  - **Envelope:** unwrap and strip.
  - **Gateway:** mocks `firebase/app` and `firebase/firestore/lite`. This follows the EmailJS spec
    precedent and is the one place SDK mocking is unavoidable. Checks: the emulator connects once,
    `orderBy('order')`, and `createdAt` is stamped.
  - **Adapter:** mocks the gateway module. Checks: lazy, with no import before subscribe; every
    status path; missing config → 503.
  - **Config:** the token and the runtime reader.
  - **Factory:** the Firebase case.
  - **Error handler:** `handleCommand` logs, rethrows and balances the loader.
  - **Write path:** `ApiWriteBaseService` and `ProposalsService`.
  - **Contact view model:** both channels OK → sent; one fails → sent and logged; both fail →
    failed; over-long input → nothing sent.
- **Rules (emulator, `npm run test:rules`):** every cell of the matrix, plus each proposal field at
  its limit and one over, a missing key, an extra key, wrong types, and a client-supplied
  `createdAt`.
- **E2E:** the main suite stays unchanged on Fake. `npm run e2e:firebase` boots the emulator, seeds
  it, serves the `emulator` build and checks on desktop, tablet and mobile that hero, videos, gallery
  and team render the seeded content. It then submits a proposal and confirms the record exists
  through the emulator's REST API. It also runs axe on the page.
- **Verification:** a production build with a local `runtime-config.js`, checked for: autoCsp lets
  the config script and the lazy chunk run, initial bundle within budget, and Lighthouse targets
  (LCP in particular).

`test:rules` and `e2e:firebase` need Java, so they run in CI and before release, not in
`npm run verify`, which has to work on a machine without Java.

## Risks carried into construction

- **LCP:** above-the-fold copy now waits on a request to `firestore.googleapis.com` instead of a
  same-origin chunk. Mitigations so far: preconnect, and the Lite SDK. If Lighthouse drops below
  95, the next step (behind an ADR) is a `modulepreload` for the gateway chunk, or caching
  stale-while-revalidate in `localStorage`.
- **`npm audit`:** `firebase-tools` pulls in a large dependency tree. If it brings a high or
  critical advisory, run it through `npx firebase-tools@<pinned>` instead of a dev dependency.
- **autoCsp:** ordering of the external classic script against module scripts. To be verified on a
  production build.
- **PR preview environments** get the production config, so a proposal submitted on a preview lands
  in the real `proposals` collection. That's acceptable for now: each record is created once and
  can't be changed.
- **Firestore location:** not yet recorded. It goes in `deployment.md`.

## ADRs raised

- [ADR-0009](../../architecture/adr/0009-firestore-data-adapter.md): Firestore data model and
  adapter (D1 to D8)
- [ADR-0010](../../architecture/adr/0010-app-check-deferred.md): App Check deferred to 1.3.0

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28
