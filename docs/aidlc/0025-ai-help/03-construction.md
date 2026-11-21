# 03 · Construction — AI help in the admin and on Leads (2.6.0)

Built on the approved [inception](01-inception.md) (D1–D8) and [design](02-design.md); a new
[ADR-0020](../../architecture/adr/0020-ai-through-the-function.md) records the approach.

| #   | Increment           | Files                                                                                                                                                                                                                                                                                                           | Tests                                                                                                                                                                                                                                  |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The function        | `api/src/lib/`: `ai-settings`, `ai-client` (OpenAI-compatible, `fetch`), `ai-limiter` (50 a day by India day), `ai-caller` (owner, Team access, Leads or running super manager), `ai-prompts`, `ai-request`, `ai-write`, `ai-leads`, `ai-status`; three routes; `IApiDependencies` gains `post` and `aiLimiter` | 10 new spec files: settings, limiter, client (answers, 429, empty, network failure), caller, prompts, write (each task, limits, picture address), leads (permissions, the summary's shape), status, request helpers. 161 tests, 99.4 % |
| 2   | The port            | `IAiService`, `AiError`, `AiErrorKind`, `AiTask`, `AiStyle`; `HttpAiService` (token header, cached status), `FakeAiService` (+ `fake-ai.constants`), `aiServiceFactory`, `provideAi()` on the admin routes                                                                                                      | `i-ai-service.spec.ts`, `http-ai.service.spec.ts`, `fake-ai.service.spec.ts`, `ai-service.factory.spec.ts`                                                                                                                             |
| 3   | Help writing        | `models/ai-assist.ts`, `AiAssistViewModel`, `AiAssistComponent`, `AiSuggestionComponent`; `schema-fields` passes each field the card's other prose; `schema-field` (prose fields) and `image-field` (uploaded photos) host it                                                                                   | the four new specs; `schema-field` (offered on prose only, Use it sets the field); `provideNoAi()` keeps the older specs as they were                                                                                                  |
| 4   | Analyse             | `models/leads-summary.ts`, `LeadsAnalysisViewModel`, `LeadsAnalysisComponent` on Leads                                                                                                                                                                                                                          | `leads-summary.spec.ts` (counts, no personal field, limits), the view model and card specs                                                                                                                                             |
| 5   | Features, e2e, docs | two Features rows shown once set up; `e2e/specs/admin-ai-help.e2e.ts`; ADR-0020, `CLAUDE.md` §1 and §3, deployment (the four settings), overview, component tree, class and sequence diagrams; CHANGELOG                                                                                                        | three sizes: rewrite and use, a failure leaves the field, describe a photo, Analyse, axe with a suggestion and an analysis showing                                                                                                     |

## Decisions & deviations from design

- **One "AI help" button opens the choices**, decided when it opens: the five styles when the field has text, **Suggest
  a first version** when it's empty. The design had separate Rewrite and Suggest buttons; the field's text isn't a
  signal, so it's read at the moment the owner asks.
- **The button is named "AI help" and described by its field** ("For Headline, first line"), not named after it: a
  name containing the field's label made the label point at two elements, for screen readers and for tests alike.
- **No AI buttons until the help is set up**, as the design says; a failure after that shows the inception's sentence
  where the suggestion would be.
- **Provider failures aren't logged in detail.** The function turns them into "not available" without the provider's
  message, which can quote the request; Azure records each call's status. (The design said "logged".)
- **The event month is sent only when the visitor's date is a plain `YYYY-MM-DD`**; free text never goes. Labels are
  cut to 60 characters and, past 40, grouped as "Other", the function's own limits.
- **The Fake's phrases live in `fake-ai.constants.ts`**, so the e2e suite can import them without Angular, as it does
  the fake accounts.
- **One existing e2e test changed:** the editor's axe scans now move the pointer away first, as other scans do. On
  tablet the menu link's click left it over the new AI help button, which axe caught part-way through its hover.
- **A 0024 test fixed:** the manager form's date test read the real clock, so it failed once the day changed; it now
  has a fixed one.
- **No dependency added**, in the app or the function. The public site's first download is unchanged: everything is on
  the admin's lazy routes.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.

---

## 2.7.0 · The chat on the site (V7)

Built on the approved 2.7.0 design.

| #   | Increment    | Files                                                                                                                                                                                                                                                                       | Tests                                                                                                                                                                   |
| --- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The function | `api/src/lib/`: `site-content` (published sections by allowlist, hidden ones left out, text only, 15-minute cache), `chat-limiter` (hashed visitor, 10 an hour, 500 a day), `chat-prompts`, `ai-chat` (`AI_CHAT=on`, the body's limits); `ai/chat` route; `indiaDay` shared | `site-content`, `chat-limiter`, `chat-prompts`, `ai-chat` specs and the registration test. 194 tests, 99.3 %                                                            |
| 2   | The app      | `ISiteChat`, `SiteChatRole`, `HttpSiteChat` (12 s), `FakeSiteChat`, `SITE_CHAT_LOADER` (its own chunk); `HomeAssistantViewModel` sends typed questions with the last 4 messages, scripts chips and failures; the panel's note                                               | the adapters' and loader's specs; the assistant's spec: AI answer, follow-up history, chips stay scripted, the note, and every older test with a chat that can't answer |
| 3   | E2E and docs | `home-assistant.e2e.ts`: the typed question now gets the Fake AI's answer, plus a failure answered by the script; deployment (`AI_CHAT`), ADR-0020's 2.7.0 section, overview, sequence diagram, CHANGELOG                                                                   | three sizes, with the accessibility scan of the open chat and the home page's approved look                                                                             |

### Decisions & deviations from design

- **The note says typed questions "may" be answered by AI.** The browser can't know whether `AI_CHAT` is on, and the note
  should be true either way; it always asks for no personal details.
- **The time-limited offer isn't sent**, as the allowlist leaves `offer` out: an ended offer could otherwise be quoted as
  current. Visitors asking about offers are pointed to the proposal form or WhatsApp.
- **A question the function refuses** (for example over 300 characters) is answered from the script, like any failure.
- **The first download grew by 0.58 kB** (507.49 → 508.07 kB; 118.44 → 118.56 kB compressed), not "unchanged" as
  the design says: the client and its import are their own chunk, but the view model's routing of typed questions, the
  loader's choice of adapter and the note are on the home page itself. Within the 510 kB warning budget.
- **The note's styles were kept minimal** (a `div`, padding and `smaller` text, in the panel's own colour): the panel's
  stylesheet is at its 4 kB budget, and a fuller style exceeded it by 100 bytes.
- **No dependency added.** The chat client is its own chunk, loaded on the first typed question.

---

**Approval (2.7.0):** ☑ Approved by Ravi Akhouri on 2026-11-22.
