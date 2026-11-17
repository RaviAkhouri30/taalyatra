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

## Update — account set up (1.8.1, 2026-11-17)

- **Service: SMTP server**, sending as `contact@taalyatra.in` through GoDaddy (`smtpout.secureserver.net`, port 465).
  The domain's SPF record (`include:secureserver.net -all`) rejects mail for taalyatra.in sent any other way, so a
  Gmail or Outlook service would bounce or land in spam.
- **Template fields** must match what `EmailJsEmailService` sends: `subject`, `message`, `from_name`, `phone` and
  `reply_to`. The template's Reply To is `{{reply_to}}`, so replying answers the visitor.
- **Only production sends real email.** Development, e2e and the emulator keep empty values and the fake adapter.
- **Exception (owner's decision, 2026-11-17): no domain lock.** CLAUDE.md §10 asks for EmailJS domain allow-listing,
  but the free plan doesn't offer it. The owner chose to go live without it and not to add a CAPTCHA. The risk: anyone
  who copies the public key can send junk to `contact@taalyatra.in` or use up the 200 emails a month. Nobody else can
  be emailed, because the template's recipient is fixed, and no request is lost, because the form also stores each
  one. Revisit if junk arrives, with the proposals inbox (1.10.0), or if the plan is upgraded.
