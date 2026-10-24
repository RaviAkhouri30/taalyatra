# ADR-0003: Signals for state, RxJS for async, no Promises

- **Status:** Accepted · **Date:** 2026-10-24 · **Version:** 1.0.0

## Context

The app is zoneless. Assigning a plain field inside a stream does not schedule change detection.
The team standard is "RxJS, no Promises".

## Decision

VMs store state in signals (`data`, `computed`). All asynchronous work stays in RxJS. SDK
Promises are wrapped with `defer()` inside `core/backends` only. ESLint (`no-restricted-syntax`)
bans `async`, `await`, `.then()`, `new Promise` and `Promise.*` elsewhere, except in tests and `main.ts`.

## Consequences

OnPush and zoneless rendering work naturally. A new developer must learn the `defer` wrapping rule.
