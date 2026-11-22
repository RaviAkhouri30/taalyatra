# 04 · Verification — AI help: the admin, the leads and the site's chat (2.6.0, 2.7.0) (2026-11-21)

Each release's checks ran on its branch before merging. Every test talks to the **Fake** AI provider: no test calls
Groq, by design (no key in CI, and answers that change from run to run).

## 2.6.0 · AI help in the admin and on Leads (V8, V12)

| Check                  | Result                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify`       | ✔ format, lint, 93 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                            |
| Unit tests             | ✔ 2,077 site tests; 155 function tests                                                                                                                                                                       |
| Coverage               | ✔ site statements 99.2 %; function 99.4 %                                                                                                                                                                    |
| Build                  | ✔ initial 507.49 kB raw, unchanged from 2.5.0; no budget warnings                                                                                                                                            |
| `npm run e2e`          | ✔ 568 of 570 in the full run on 8 workers (load average 27 on 10 cores). A slow sign-in and a 2 % home screenshot difference, which this release doesn't touch, passed on rerun. New: `admin-ai-help.e2e.ts` |
| `npm run test:rules`   | ✔ not affected: no rules change                                                                                                                                                                              |
| `npm run e2e:firebase` | ✔ 42 of 42 in 2.1 minutes; no function there, so no AI buttons, as designed                                                                                                                                  |
| `npm audit --omit=dev` | ✔ no dependency added, in the app or the function                                                                                                                                                            |
| Sonar quality gate     | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                                                                                                                          |
| Lighthouse             | ☐ Not run: the public site's code didn't change                                                                                                                                                              |

## 2.7.0 · The chat on the site (V7)

| Check                  | Result                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ 95 diagrams, 2,088 site tests (99.2 %), 194 function tests (99.3 %), build. The chat note's styles were trimmed afterwards to clear a budget warning: Prettier, its 18 tests, the build and the full e2e were rerun for that, and every later `verify` (2.8.0, 2.9.0) passed with it |
| Build                  | ◐ initial 508.07 kB raw, 0.58 kB more than 2.6.0 (recorded in construction); no budget warnings                                                                                                                                                                                        |
| `npm run e2e`          | ✔ 568 of 573 in the full run (load average 20–25); the 5 passed on rerun. New: `home-assistant.e2e.ts`                                                                                                                                                                                 |
| `npm run e2e:firebase` | ✔ 42 of 42 in 2.2 minutes                                                                                                                                                                                                                                                              |
| Lighthouse             | ☐ Not run. The chat's code loads only on the first typed question, so the first view is unchanged but for the 0.58 kB                                                                                                                                                                  |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                                                         | Result                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rewrite a field in a style; see it beside your text; nothing changes until **Use it**; no button on links, numbers, dates | ✔ `ai-assist.component.spec.ts`, `ai-assist.view-model.spec.ts`, `ai-suggestion.component.spec.ts`; e2e. The button shows on text and multi-line fields only (`schema-field.component.spec.ts` checks links, phone and email) |
| **Suggest** a first version for an empty field                                                                            | ✔ `ai-assist.view-model.spec.ts`, `ai-prompts.spec.ts`                                                                                                                                                                        |
| **Suggest a description** for a picture, when the provider reads pictures                                                 | ✔ `ai-write.spec.ts`, `ai-settings.spec.ts` (`AI_VISION_MODEL`); e2e                                                                                                                                                          |
| **Analyse** sends only counts; the function refuses anything else; the result shows with its date                         | ✔ `leads-summary.spec.ts`, `ai-leads.spec.ts`, `leads-analysis.view-model.spec.ts`; e2e                                                                                                                                       |
| The chat answers from the site's content, briefly, pointing to the form or WhatsApp, and says it's AI                     | ✔ `ai-chat.spec.ts`, `chat-prompts.spec.ts`, `site-content.spec.ts`, `home-assistant.component.spec.ts`; e2e                                                                                                                  |
| AI unavailable, a limit, or offline: the chat uses the script; the admin says "AI help isn't available"                   | ✔ `http-site-chat.spec.ts`, `http-ai.service.spec.ts`; e2e (both)                                                                                                                                                             |
| Sign-in for the admin routes, Leads checked as the rules do; limits per visitor, account and day; settings in Azure only  | ✔ `ai-caller.spec.ts`, `ai-limiter.spec.ts`, `chat-limiter.spec.ts`, `ai-settings.spec.ts`, `functions.spec.ts`                                                                                                               |
| No WCAG 2.2 AA violations; first download unchanged; the chat's AI code loads only on a question                          | ✔ axe in `admin-ai-help.e2e.ts` and on the open chat (`home-a11y.e2e.ts`), three sizes; `site-chat-loader.token.spec.ts`. ◐ download: unchanged at 2.6.0, +0.58 kB at 2.7.0                                                   |

## Known gaps

- **Groq itself is untested here**, and **nothing AI works on the live site until the owner adds the Azure settings**
  (05). The first real answers are the check.
- **The answers' quality** (tone, staying on the site's facts) is judged by reading them, not by a test.
- **The download grew 0.58 kB at 2.7.0**, against the inception's "unchanged".
- **Date and number fields aren't in the button test's list.** The button is offered only on text and multi-line
  fields, so they have none, but no test names them.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
