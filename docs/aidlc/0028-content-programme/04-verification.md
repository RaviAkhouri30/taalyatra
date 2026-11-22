# 04 · Verification — The rest of the content (2.10.0, 2.11.0, 2.12.0) (2026-11-23)

## 2.10.0 · The home sections

The checks below ran on `feat/0028-home-sections` before merging.

| Check                  | Result                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 101 Mermaid diagrams render, typecheck, coverage, function tests, production build                                          |
| Coverage               | ✔ statements 99.24 %, branches 96.62 %                                                                                                      |
| Build                  | ✔ initial 509.38 kB raw (+0.02 kB, the cities anchor); no budget warnings                                                                   |
| `npm run e2e`          | ✔ 654 passed on 8 workers in 7.4 minutes, after 12 dashboard baselines were re-recorded (checked by eye). New: `admin-home-sections.e2e.ts` |
| `npm run test:rules`   | ✔ 377 of 377 (33 new: `firestore-home-sections.rules.spec.ts`)                                                                              |
| `npm run e2e:firebase` | ☐ Not recorded for this release                                                                                                             |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                       |
| Sonar, Lighthouse      | ☐ Not run (Sonar needs its token; the site changed by one anchor)                                                                           |

| Criterion (from the [inception](01-inception.md) and [design](02-design.md)) | Result                                                                                              |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Every home section but the chat's script has an editor page or card          | ✔ nine documents, six new pages; `home-story` and `home-lists` specs load today's content unchanged |
| Each follows drafts, preview, approval, history, backups, Find and AI help   | ✔ schema-driven; the rules tests cover publishing, approval and self-approval on the new pages      |
| A manager's new pages start at Needs approval                                | ✔ the role specs; `firestore-home-sections.rules.spec.ts`                                           |
| Changes reach the site                                                       | ✔ e2e: a FAQ question, a city, the trust strip                                                      |
| No WCAG 2.2 AA violations on the new pages, three sizes                      | ✔ axe in `admin-home-sections.e2e.ts`                                                               |

## 2.11.0 · The inner pages, and search titles and descriptions

The checks below ran on `feat/0028-inner-pages` before merging.

| Check                  | Result                                                                                                                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 101 diagrams, typecheck, coverage, function tests, production build                                                                                                                                                                 |
| Unit tests             | ✔ 2,288 site tests; 194 function tests                                                                                                                                                                                                              |
| Coverage               | ✔ statements 99.25 %, branches 96.66 %, functions 98.61 %, lines 99.36 %                                                                                                                                                                            |
| Build                  | ✔ initial 509.94 kB raw (+0.56 kB); 0.06 kB under the warning                                                                                                                                                                                       |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers: 680 of 681 in 8.3 minutes; the one failure, the tablet `#insta` screenshot, passed in the earlier full run and on rerun (16 of 16). 12 dashboard baselines re-recorded. New: `admin-inner-pages.e2e.ts` |
| `npm run test:rules`   | ✔ 403 of 403 (26 new: `firestore-inner-pages.rules.spec.ts`)                                                                                                                                                                                        |
| `npm run e2e:firebase` | ✔ 42 of 42 in 2.0 minutes, on its own single worker                                                                                                                                                                                                 |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                                                               |
| Sonar, Lighthouse      | ☐ Not run (Sonar needs its token)                                                                                                                                                                                                                   |

| Criterion                                                                     | Result                                                                                                            |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| The Videos, Team, Shows and Achievements pages' own text is editable          | ✔ `inner-pages.sections.spec.ts`: today's content loads unchanged, no part left out; e2e on Team and Achievements |
| Each card previews its own page                                               | ✔ the frame, scroller and view model specs; e2e (the Team page's heading in its preview)                          |
| Search and sharing: a title and description per page; empty keeps the default | ✔ `seo.sections.spec.ts`, `seo.service.spec.ts`; e2e (the Videos page's tab title and description tag)            |
| `pages/admin` stays the developer's                                           | ✔ `firestore-inner-pages.rules.spec.ts`                                                                           |
| No WCAG 2.2 AA violations on Achievements and Search and sharing, three sizes | ✔ axe in `admin-inner-pages.e2e.ts`                                                                               |

### Known gaps

- **Lighthouse wasn't run** after the public site's title and description changes; the tags themselves are checked by
  unit and e2e tests.
- **0.06 kB is left** under the first download's warning: the next public change must make room first.

## 2.12.0 · The chat and the proposal form

The checks below ran on `feat/0028-chat-and-form` before merging.

| Check                  | Result                                                                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 101 diagrams, typecheck, coverage, function tests, production build                                                                                                                        |
| Unit tests             | ✔ 2,317 site tests (29 new); 194 function tests                                                                                                                                                            |
| Coverage               | ✔ statements 99.25 %, branches 96.64 %                                                                                                                                                                     |
| Build                  | ✔ initial 509.94 kB raw, unchanged                                                                                                                                                                         |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers: 682 of 696 in 9.1 minutes; the 14 failures were all the Theme spec on desktop timing out, which then passed 63 of 63 on its own. New: `admin-chat-form.e2e.ts` |
| `npm run test:rules`   | ✔ 411 of 411 (7 new: `firestore-chat.rules.spec.ts`)                                                                                                                                                       |
| `npm run e2e:firebase` | ✔ 42 of 42 in 1.9 minutes, on its own single worker                                                                                                                                                        |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                      |
| Sonar, Lighthouse      | ☐ Not run (Sonar needs its token; the site changed in the chat's matching only)                                                                                                                            |

| Criterion                                                                  | Result                                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| The chat's greeting, quick questions and answers are editable              | ✔ `chat-form.sections.spec.ts`; e2e (a changed answer given by the chat on the site)                          |
| The proposal form's choices, promises and messages are editable            | ✔ `chat-form.sections.spec.ts` (every nested part has a field); e2e (the event types start on the chosen one) |
| A list can't start on a choice it doesn't have                             | ✔ `form-choices-rule.spec.ts`; e2e (publishing blocked)                                                       |
| The chat matches words whatever their case                                 | ✔ `assistant-replies.spec.ts`                                                                                 |
| Every home section has an editor                                           | ✔ `EDITABLE_HOME_SECTIONS` lists all 21; the admin's rules test now stores its own document                   |
| No WCAG 2.2 AA violations on Chat assistant and Proposal form, three sizes | ✔ axe in `admin-chat-form.e2e.ts`                                                                             |

### Known gaps

- **The chat can't be previewed** in the editor's preview (it never opens there); its wording shows once published or
  in the full preview.
- **Under heavy load the Theme spec times out** in the full run: it publishes every theme on three sizes. It passes on
  its own; a later release could split it.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
