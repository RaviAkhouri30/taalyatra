# ADR-0001: MVVM on standalone Angular

- **Status:** Accepted · **Date:** 2026-10-24 · **Version:** 1.0.0

## Context

The reference project (Resume3.0) uses Component → ViewModel → Service on NgModules. Angular 22
defaults to standalone, zoneless and signal-first.

## Decision

Keep the Resume3.0 MVVM layering (`BaseComponent`, `ViewModel<T>`, `ApiBaseService`), but use
standalone components, component-scoped `@Injectable()` view models and root `@Service()` services.
No NgModules.

## Consequences

- Each component gets its own VM instance with no shared mutable state.
- Lint enforces `prefer-standalone`, `prefer-on-push…` and `prefer-inject`.
