# 01 · Inception — AI help: the admin, the leads and the site's chat (2.6.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V8 (AI help in the admin), V12's AI analysis of the
leads, and V7 (a smart chat assistant on the site), planned together as 2.6.0. The provider was decided on 2026-11-17
(programme D1): **Groq**, on its free tier, through any OpenAI-compatible chat API, called only from the Azure Function,
so the key never reaches a browser and changing provider is a settings change.

## Problem / goal

Writing for the site, and making sense of the leads, takes the owner and managers time; the chat on the home page only
knows a few scripted answers. AI can help with all three, if it never sees visitors' personal details, never runs up a
bill, can't be abused from the public site, and leaves everything working as today when it's unavailable.

## What exists

| Area            | Today (2.5.0)                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Azure Function  | `api/`: signs and deletes uploads; checks a Firebase sign-in (`verifyToken`) and reads the caller's role with their own token |
| Editor fields   | Text and multi-line fields, each with a fixed help line (`i-field-schema.ts`); pictures with a description                    |
| Leads           | List, filters, status, CSV export (0018, 0022); stored with names, phones and emails                                          |
| Chat assistant  | Scripted answers on the home page (`assistant-replies.ts`), no network                                                        |
| Public download | Tight: the chat's AI part must load only when the visitor asks, like the speed reports                                        |

## User stories

- **As the owner or a manager, I want Rewrite with AI on a text field** (clearer, shorter, warmer, more formal), so I can
  accept, edit or ignore a better version. (V8)
- **As the owner or a manager, I want a suggestion for an empty field**, beside its help line. (V8)
- **As the owner or a manager, I want a suggested description for a picture**, for people who can't see it. (V8)
- **As the owner, or a manager given Leads, I want an AI analysis of the leads**: which events, sizes, months and
  experiences bring work, and what wins, from anonymous figures only. (V12)
- **As a visitor, I want the chat to answer my question from the site's own content**, and point me to a proposal or
  WhatsApp; when the AI is unavailable, the scripted answers still work. (V7)

## Acceptance criteria

- [ ] Given a text or multi-line field with text, when I press **Rewrite with AI** and choose a style, then I see the
      suggestion beside my text and can **Use it**, edit it, or **Keep mine**; nothing changes until I choose. Links,
      phone numbers, emails, dates and numbers have no button.
- [ ] Given an empty text field, then **Suggest** offers a first version, written from the section and the site's
      content.
- [ ] Given a picture, then **Suggest a description** offers one, if the provider has a model that reads pictures (D5).
- [ ] Given Leads (the owner, or a manager with Leads), when I press **Analyse**, then the browser sends only counts by
      event type, group size, month, experience and status, never a name, phone, email or message, and the function
      refuses anything else; the analysis shows on the page with its date.
- [ ] Given a visitor's question, then the chat answers from the site's content (experiences, shows, FAQ, contact),
      briefly, in the site's voice, and offers the proposal form or WhatsApp; the chat says answers are written by AI and
      asks the visitor not to share personal details.
- [ ] Given the AI unavailable, a limit reached, or the visitor offline, then the chat answers from the scripted replies,
      and the admin buttons say "AI help isn't available right now", with nothing else affected.
- [ ] Given a call to the function, then it needs a sign-in for V8 and V12 (Leads checked as the rules do), and limits
      apply per visitor, per account and per day (D4); the key, address and model live in Azure settings only.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on the new controls, on three sizes; the public site's
      first download is unchanged, and the chat's AI code loads only when the visitor sends a question.

## Units of work

1. **The AI endpoint** (`api/`): one OpenAI-compatible client (`AI_API_URL`, `AI_MODEL`, `AI_API_KEY`, optional
   `AI_VISION_MODEL`), a timeout, and the limits; behind it, three routes: `ai/write` (signed in), `ai/leads` (Leads),
   `ai/chat` (public). Fake responses for tests and e2e, as for uploads.
2. **A port in the app:** `IAiService` with a Fake and an HTTP adapter (`core/backends`), provided on the admin routes,
   and lazily on the home page for the chat.
3. **V8 in the editor:** the Rewrite menu and Suggest on text fields, Suggest a description on pictures, the suggestion
   panel (use, edit, keep mine).
4. **V12 on Leads:** the anonymous summary built in the browser, **Analyse**, and the result card.
5. **V7 on the site:** the chat asks the function; the scripted replies stay as the fallback; the AI notice; the AI code
   loads on the first question.
6. Tests (unit, API at 90 %+, e2e on three sizes with axe), the deployment notes for the Azure settings, records,
   CHANGELOG, release.

## Decisions for the owner

| #   | Decision                       | Recommendation                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **One release or two**         | **Two.** **2.6.0:** the endpoint, V8 and V12, all behind a sign-in, so nothing public changes. **2.7.0:** V7, the public chat, which carries the abuse, privacy and download-size risks and is easier to judge once the endpoint has run for a while. The installable app and the themes then move to 2.8.0 and 2.9.0                                 |
| D2  | **Who sets up Groq**           | **You:** create a free Groq account, make an API key, and put it with the address and model in the Static Web App's environment variables (the deployment notes will list them). The key never passes through me or the code. Until it's set, every AI button says it isn't available, and the release is safe to deploy                              |
| D3  | **What may be sent to the AI** | **Only:** the field's text and its section (V8); a picture's public Cloudinary address (V8); counts, never records (V12); the visitor's question and the site's published content (V7). Never a lead, a draft of another page, an email address or a phone number from Leads. Nothing sent is stored by the site                                      |
| D4  | **Limits**                     | **Per signed-in account: 50 AI requests a day. Per visitor (V7): 10 questions an hour. Overall: 500 a day for the public chat**, so it can't use up the free tier the admin needs. Kept in the function's memory, so they're approximate across its instances; Groq's own free limits are the hard ceiling, and without a card there's nothing to pay |
| D5  | **Suggest a description**      | **Include it when a picture-reading model is set** (`AI_VISION_MODEL`); without one the button doesn't show. Free picture models come and go, so it shouldn't hold up the rest                                                                                                                                                                        |
| D6  | **Rewrite styles**             | **Clearer, Shorter, Warmer, More formal**, as V8 says, plus **Fix spelling and grammar**. In English; a field's suggestion keeps its language if you write in Hindi                                                                                                                                                                                   |
| D7  | **Which fields**               | **Text and multi-line fields only**; not links, phone numbers, emails, dates, numbers, colours or choices, where a rewrite could break something                                                                                                                                                                                                      |
| D8  | **Who may use it**             | **The owner and every manager**, on the pages they can see (V8). **Analyse:** the owner and managers with Leads (V12). The function checks the sign-in and, for Analyse, the Leads switch, as the rules do                                                                                                                                            |

## Risks & open questions

- **Personal data reaching the AI.** Mitigation: the leads summary is built in the browser from counts, and the
  function rejects any field it doesn't expect (a fixed shape, checked in its tests); Leads never offers rewriting.
- **Free tiers change.** Groq's limits can be cut, or a model withdrawn. Mitigation: provider, address and model are
  settings; every feature falls back to today's behaviour.
- **Wrong or invented answers (V7).** Mitigation: the chat is told to answer only from the site's content and to send
  everything else to the proposal form or WhatsApp; it never quotes prices that aren't on the site. Reviewed with real
  questions before 2.7.0 ships.
- **Abuse of the public chat (V7).** Mitigation: the limits in D4, a short maximum question length, and the scripted
  fallback; D1 puts it in its own release.
- **The function grows.** Three routes join two. Mitigation: one small client and one limiter shared by all, each route
  tested on its own, 90 % coverage as today.
- **Prompt injection.** A rewrite request or a visitor's question could try to change the instructions. Mitigation: the
  AI's answer is only ever shown as a suggestion (V8, V12) or a chat message (V7); it never writes, publishes or calls
  anything.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21, with D1–D8 as recommended: 2.6.0 is the endpoint, V8 and
V12; V7, the public chat, follows in 2.7.0.
