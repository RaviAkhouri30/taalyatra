# ADR-0002: Backend ports, adapters and a factory

- **Status:** Accepted · **Date:** 2026-10-24 · **Version:** 1.0.0

## Context

Firestore, a REST API and a fake backend must be swappable without touching feature code.

## Decision

`IHttpBackend` is an abstract class used as the DI token. `ApiServiceProviderFactory` picks an
adapter from `APP_ENVIRONMENT`. All adapters return `Observable<HttpResponse<T>>`. Auth, email and
media use the same pattern.

## Consequences

- Feature code is SDK-free and unit tests swap in a Fake through DI.
- Browser APIs that return Promises get the same treatment: `IClipboardService` (1.3.0) wraps
  `navigator.clipboard.writeText` in `BrowserClipboardService`, with a fake for specs.
- `HttpClient` is wrapped in `RestHttpBackend` (`observe: 'response'`) instead of being returned
  directly as in Resume3.0, so it honours the port contract (Liskov).
