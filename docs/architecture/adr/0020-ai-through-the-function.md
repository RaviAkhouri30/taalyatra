# ADR-0020: AI through the Azure Function

- **Status:** Accepted
- **Date:** 2026-11-21
- **Version:** 2.6.0

## Context

Version 2 adds AI help (programme V7, V8, V12): rewriting and suggesting text in the admin, describing photos, and
analysing leads, then a smarter chat on the site (2.7.0). The owner chose **Groq** on its free tier (programme D1).
Free tiers change and models come and go; the key must never reach a browser; leads hold customers' personal details;
and the public site's first download has almost no room left.

## Decision

- **The Azure Function is the only caller.** `api/` gains `ai/status`, `ai/write` and `ai/leads`, each checking the
  Firebase sign-in as uploads do (the owner by id, anyone else by their own `roles/{uid}`; Analyse needs Leads or a
  running super manager). The browser never sees the provider's address or key.
- **Provider-neutral.** The function speaks the OpenAI-compatible chat format, which Groq, Cloudflare, Gemini,
  OpenRouter, Mistral and OpenAI all accept, with `fetch`: no SDK, no new dependency. `AI_API_URL`, `AI_MODEL`,
  `AI_API_KEY` and the optional `AI_VISION_MODEL` are settings, so changing provider is a settings change.
- **What may be sent is fixed in code (0025 D3):** a field's text, its label, help line and page, and the same card's
  other prose; a photo only by its address in the site's own Cloudinary folder; leads only as counts, in a fixed shape
  the function rebuilds, refusing any other key. Nothing sent is stored.
- **Answers are plain text, shown as suggestions.** The AI never writes, publishes or calls anything: the owner uses a
  suggestion or not. This contains prompt injection to what the owner reads.
- **Limits (0025 D4):** 50 requests a day per account, counted in the function's memory (approximate across
  instances); the provider's free limits are the hard ceiling.
- **In the app**, `IAiService` is a port like the others: `HttpAiService` for a Firebase build, `FakeAiService` for
  development, tests and e2e, provided on the admin routes only. Until the settings exist, `ai/status` says so and the
  admin shows no AI buttons.

## Consequences

- No cost and no lock-in; the site works exactly as before whenever the AI doesn't.
- The function holds one more secret (`AI_API_KEY`), set by the owner in Azure.
- Limits are per instance, so a burst across instances can exceed 50 a day; acceptable for a handful of accounts.
- Provider errors aren't logged in detail: the function turns them into "not available" without the provider's message,
  which can quote the request. Azure still records each call's status.
- 2.7.0's public chat reuses the client and limiter, adding a per-visitor limit and a daily cap of its own.
