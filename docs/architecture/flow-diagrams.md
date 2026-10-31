# Flow Diagrams

## Request pipeline (`HttpsErrorHandler`)

```mermaid
flowchart LR
  A[backend call] --> B[loader.show]
  B --> C{response<br/>within timeout?}
  C -- no --> T[408 timeout error] --> N[notify user] --> E[emit EMPTY · loader.hide]
  C -- yes --> D{status 2xx?}
  D -- no --> N
  D -- yes --> F[loader.hide] --> G[unwrap body] --> H[ViewModel]
```

## Backend selection (factory)

```mermaid
flowchart TD
  S[app bootstrap] --> F[ApiServiceProviderFactory]
  F --> Q{APP_ENVIRONMENT.backend}
  Q -- Fake --> K[FakeHttpsService<br/>unit tests · e2e · offline]
  Q -- Firebase --> FB[FirebaseBackendService]
  Q -- Rest --> R[RestHttpBackend]
```

## Feature delivery (AIDLC)

```mermaid
flowchart LR
  I[Inception<br/>stories · AC] -->|approve| D[Design<br/>diagrams · ADRs]
  D -->|approve| C[Construction<br/>code + tests]
  C --> V{npm run verify<br/>+ e2e green?}
  V -- no --> C
  V -- yes -->|approve| O[Operations<br/>release:minor · CHANGELOG · deploy]
```

## Email adapter selection (factory)

```mermaid
flowchart TD
  S[app bootstrap] --> F[emailServiceFactory]
  F --> Q{environment.emailJs<br/>serviceId, templateId, publicKey all set?}
  Q -- yes --> E[EmailJsEmailService]
  Q -- no --> K[FakeEmailService<br/>dev · tests · e2e]
```

## User journeys

### Deep link to a home section (`/#contact`)

```mermaid
flowchart LR
  L[link /#contact] --> R[Router Scroll event]
  R --> W{"#contact in the DOM?"}
  W -- no --> M[MutationObserver waits<br/>max 5 s] --> W
  W -- yes --> F[next animation frame] --> S[ViewportScroller.scrollToAnchor]
```

### Proposal request

```mermaid
flowchart TD
  A[visitor fills the form] --> B{Request proposal}
  A --> WA[Send on WhatsApp<br/>link already carries the answers]
  B --> V{name and phone valid?}
  V -- no --> E[inline errors · aria-invalid]
  V -- yes --> S[status: sending · button disabled]
  S --> M{IEmailService.send}
  M -- ok --> OK[status: sent · form reset to defaults]
  M -- error --> ER[status: failed · suggest WhatsApp]
```

### Intro loader

```mermaid
flowchart LR
  H[home renders] --> RM{reduced motion?}
  RM -- yes --> X[hidden]
  RM -- no --> P{IntroPlaybackService.claim}
  P -- first time --> SH[show ~3.5 s · removed on fade-out end]
  P -- already played --> X
```

### Owner switches on the public site (1.6.0)

```mermaid
flowchart LR
  V["site/visibility<br/>(preloaded with site/config)"] --> SV[SiteVisibilityService<br/>missing = all on]
  SV --> H["Home: optional sections render only when on<br/>(no data read when off)"]
  SV --> L["applyVisibility · visibleLink:<br/>menus · footer · See all"]
  SV --> G["pageEnabledGuard (canMatch):<br/>page off → /"]
  SV --> W["Shell: utility bar · action bar · WhatsApp · Home: intro · assistant"]
  P["site/config.promotion<br/>live · startsOn · endsOn"] --> PS["PromotionSchedule (Pune time)"]
  PS -->|"not live today"| N["no promotion: badge, offer section and Diwali links hidden"]
```
