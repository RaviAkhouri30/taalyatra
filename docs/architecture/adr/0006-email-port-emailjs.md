# ADR-0006: Email port with EmailJS and fake adapters

- **Status:** Accepted · **Date:** 2026-10-26 · **Version:** 1.1.0

## Context

The proposal form must send email from a static site with no server of its own. EmailJS sends
from the browser with a public key, but its SDK returns Promises, and the account does not exist yet.

## Decision

`IEmailService` (abstract class = DI token) with one method, `send(IEmailMessage): Observable<void>`.
`EmailJsEmailService` wraps `@emailjs/browser` `send()` in `defer()`; `FakeEmailService` accepts
every message after `fakeLatencyMs`. `emailServiceFactory()` picks EmailJS only when
`environment.emailJs` has a service id, template id and public key, otherwise the fake.
`provideBackend()` registers it next to `IHttpBackend`.

## Consequences

- The site works end to end today; going live is a configuration change, not a code change.
- Only the public key reaches the browser. Abuse is limited by EmailJS domain allow-listing and
  rate limits, which must be set in the dashboard before go-live.
- The view model never sees the SDK; specs inject a stub `IEmailService`.
