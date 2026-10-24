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

## User journeys

Add one flowchart per journey (navigation, contact, sign-in …) as features are designed.
