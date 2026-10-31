# Architecture Overview

## System context

```mermaid
flowchart LR
  user([Visitor / Admin]) -->|HTTPS| spa[Taal Yatra SPA<br/>Angular 22]
  spa -->|Firestore Lite SDK, lazy| fs[(Firebase Firestore<br/>project taal-yatra)]
  spa -->|Auth SDK| auth[Firebase Auth]
  spa -->|Image delivery| cdn[Cloudinary CDN]
  spa -->|Contact form| mail[EmailJS]
  fn[Backend function<br/>signed uploads] -->|API secret| cdn
  spa -->|Upload signature| fn
```

## Layers (MVVM + ports & adapters)

```mermaid
flowchart TB
  subgraph View
    C[Component<br/>OnPush, template only]
  end
  subgraph Presentation
    VM[ViewModel<br/>@Injectable, component-scoped<br/>signals + RxJS]
  end
  subgraph Application
    S[Feature Service<br/>@Service root<br/>endpoints]
    B[ApiBaseService<br/>+ HttpsErrorHandler]
  end
  subgraph Ports
    P{{IHttpBackend · IAuthService (1.4.0)<br/>IDocumentStore (1.6.0) · IEmailService<br/>IMediaService · IClipboardService}}
  end
  subgraph Adapters [core/backends]
    F[Firebase*]
    K[Fake*]
    R[Rest / EmailJS / Cloudinary]
  end
  C --> VM --> S --> B --> P
  P -. factory picks one .-> F & K & R
```

## Content editing (1.6.0)

The owner edits content at `/admin` (0008). Edits autosave as **drafts** (`drafts/*`) through
`IDocumentStore`, which reads fresh and commits atomically. **Publish** writes every draft live in
one commit and keeps the previous versions in `publishes/*` for undo. `?preview` shows the real
site with the drafts through `DraftOverlayBackend`
([ADR-0013](adr/0013-drafts-publish-preview.md)). Editors are built from field schemas
([ADR-0014](adr/0014-schema-driven-editors.md)). `site/visibility` switches home sections, inner
pages and widgets ([ADR-0015](adr/0015-site-visibility.md)). Only the admin UID may write, by
`firestore.rules`.

## Dependency rules

1. `features → shared → core/interfaces`. Arrows never point back up.
2. Features never import other features. Shared code moves to `shared/`.
3. Only `core/backends` imports SDKs (`firebase/*`, `@emailjs/browser`, `HttpClient`).
4. Only factories in `core/factories` reference concrete adapters.
5. Components never inject services that do data access. They talk to their own view model.

## State model

- **Signals** hold state: VM `data`, `computed()` values, component `input()`.
- **RxJS** moves data: loading, user commands, retries, timeouts.
- Promises exist only inside adapters (wrapped with `defer`), in tests, and in the Node tooling
  scripts under `scripts/`.

## Runtime configuration

The Firebase web config comes from `runtime-config.js` (`globalThis.__FIREBASE_CONFIG__`), loaded
before the app bundle and read by the `FIREBASE_CONFIG` token. The emulator build overrides it with
`environment.firebase`. See [deployment.md](deployment.md).
