# ADR-0007: Defer below-the-fold home sections on idle, not on viewport

- **Status:** Accepted · **Date:** 2026-10-26 · **Version:** 1.1.0

## Context

CLAUDE.md §6 asks for below-the-fold sections in `@defer (on viewport)`. The home page is also
navigated by anchor links (`/#contact`, `/#faq`, the promo badge, the menu). With `on viewport`, a
section that is far from the viewport is never rendered, so the anchor target does not exist and
the link cannot scroll to it.

## Decision

Everything after the trust row is one `@defer (on idle)` block. The intro, hero, marquee and trust
row stay eager. `AnchorScrollService` already waits for a target element to appear, so deep links
work once the deferred chunk has rendered.

## Consequences

- The home route's lazy chunk dropped from 188 kB to 18 kB; each section is its own chunk loaded
  right after first paint. The initial bundle grew by ~10 kB (3 kB transfer) because esbuild
  hoisted shared code into it; the home critical path is still ~20 kB (transfer) smaller.
- Sections still render nothing until their data arrives, so layout behaviour is unchanged.
- CLAUDE.md §6 now names `on idle` as the variant for anchor-addressable sections.
