# 03 · Construction — Home page

Built one task at a time from [plan.md](plan.md); each section was checked against the
prototype's computed styles at 1440, 1000, 620, 375, 1700 and 2300 px wide (900 and 1080 px tall).

| #     | Increment                                         | Files (under `src/app`)                                   | Tests                                 |
| ----- | ------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| 1–4   | Data layer, routing, home container               | `core/*`, `app.routes.ts`, `features/home/home-page.*`    | unit                                  |
| 5–21  | Sections hero … FAQ                               | `features/home/sections/<name>/`                          | unit + e2e (hero, offer, audiences, experiences, game) |
| 22    | Contact: proposal form, aside, email port         | `sections/contact/`, `core/interfaces/i-email-service.ts`, `core/backends/{emailjs,fake}`, `core/factories/email-service.factory.ts` | unit + `home-contact.e2e.ts` |
| 23    | Chat assistant + floating cluster                 | `sections/assistant/`, `shared/services/overlay-state.service.ts` | unit + `home-assistant.e2e.ts` |
| 24    | Intro loader (once per visit)                     | `sections/intro/`                                         | unit                                  |
| 25    | Journeys, a11y states, visual baselines, image fill mode, `@defer (on idle)` | `e2e/specs/home-{journeys,a11y,visual}.e2e.ts` | 108 e2e |
| 26    | Docs, ADRs 0006–0008, CHANGELOG, version 1.1.0    | `docs/`, `CLAUDE.md`, `CHANGELOG.md`                       | —                                     |

## Decisions & deviations from design

- **Real email submit.** The design's "Request proposal" opens a `mailto:` link; the app sends the
  request through `IEmailService` (EmailJS) and confirms on the page. "Send on WhatsApp" is kept.
- **Inline validation and status messages** (not in the design): name and phone are required,
  email is optional but checked; errors use `aria-invalid` + `aria-describedby`.
- **Contrast fixes** (ADR-0008): the proof section's ghost button uses the `Line` variant; the
  contact note's 9 % dark tint became a 10 % light tint (ink text 4.2:1 → above 5:1).
- **Promo badge steps aside while the chat is open**, because on phones the panel covered it
  while its links stayed focusable (axe target-size).
- **Launcher column passes clicks through** (`pointer-events: none` on `.fab`): its box covered
  the open panel's send button. The prototype has the same flaw.
- **Cropped photos use `NgOptimizedImage` `fill` mode** inside a sized frame, so Angular's
  aspect-ratio warning (it ignores `object-fit`) no longer fires; computed styles still match.
- **Lightbox focus is deferred one animation frame**: WebKit dropped focus given in the frame the
  component's stylesheet is first attached, stranding keyboard users on iPad/Safari.
- **Native submit for the chat input**: `(ngSubmit)` needs a form-group directive; a standalone
  `FormControl` form would have reloaded the page.
- **Below-the-fold sections are deferred `on idle`** (ADR-0007), not `on viewport`.
- **Measurement artefacts accepted**: prototype placeholder text (`{{…}}` filled with "0"),
  `min-height: auto` vs `0px` reporting, and default `color` on buttons whose SVGs the prototype
  strokes explicitly.

---

**Approval:** ☐ Pending
