# 01 · Inception — Home page

## Problem / goal

Build the public home page from the design prototype (`design/prototype/project/Main.dc.html`)
pixel-perfect on every viewport, on the MVVM + ports/adapters foundation from 1.0.0. Until
Firebase exists, every section reads its content from `fake-db.json` through `FakeHttpsService`,
so swapping in Firestore later touches no feature code.

## User stories

- As a **visitor**, I want to understand what a drum circle is, who it is for and what it costs
  to plan, so that I can decide whether to book.
- As a **visitor**, I want to request a proposal in one form, or send the same answers on
  WhatsApp, so that I get timings, setup and pricing without a phone call.
- As a **visitor**, I want quick answers to common questions from a chat assistant, and one-tap
  call/WhatsApp, so that I am never stuck.
- As a **visitor on a phone**, I want the same content laid out for a small screen, with call,
  WhatsApp and proposal always one tap away.
- As a **keyboard or screen-reader user**, I want every control, dialog and form to be operable
  and announced correctly (WCAG 2.2 AA).
- As the **business**, I want all copy to come from data, so that the admin panel can edit it later.

## Acceptance criteria

- [x] Given the home route, when it loads, then all 20 design sections (plus the intro and chat cluster) render in design order,
      each from its own endpoint under `home/*` (plus `videos`, `gallery`, `team`).
- [x] Given any viewport from 375 to 2300 px wide, when computed styles are compared with the
      prototype, then they match except for documented deviations (03-construction.md).
- [x] Given a link such as `/#contact`, when followed, then the page scrolls to that section even
      though sections render after their data arrives.
- [x] Given the proposal form, when name or phone is missing or invalid, then accessible inline
      errors appear and nothing is sent; when valid, the request is emailed and confirmed.
- [x] Given the proposal form, when answers change, then "Send on WhatsApp" carries them.
- [x] Given the chat assistant, when a question is asked, then a canned reply appears after a short
      typing pause; Escape closes the panel and returns focus to the launcher.
- [x] Given reduced motion, when the page loads, then the intro loader and decorative animations
      are skipped.
- [x] axe reports no WCAG 2.2 AA violations, including with the chat, form errors and photo viewer open.

## Units of work

See [plan.md](plan.md): 4 foundation tasks, 19 section tasks (5–23), intro loader (24),
e2e + visual pass (25), docs + release (26).

## Risks & open questions

- EmailJS account not created yet: the factory falls back to `FakeEmailService` until
  `environment.emailJs` is filled in (ADR-0006).
- Photos are placeholders; real event photos arrive with the admin panel.
- Chat answers are canned keyword matches, not an AI model.

---

**Approval:** ☐ Pending
