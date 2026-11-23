# 04 · Verification — AI help that feels good to use (2.13.0) (2026-11-23)

The checks below ran on `feat/0029-ai-help-look` before merging.

| Check                  | Result                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint, 104 Mermaid diagrams render, typecheck, coverage, function tests, production build                                                                                                       |
| Unit tests             | ✔ 2,355 site tests; 194 function tests                                                                                                                                                                   |
| Coverage               | ✔ statements 99.23 %, branches 96.51 %, functions 98.57 %, lines 99.36 %                                                                                                                                 |
| Build                  | ✔ initial 509.94 kB raw, unchanged; no style-budget warnings                                                                                                                                             |
| `npm run e2e`          | ✔ after a rerun. The full run on 8 workers: 694 of 708 in 8.2 minutes; the 14 failures were the Theme spec on desktop timing out, which then passed 63 of 63 on its own. `admin-ai-help.e2e.ts` 27 of 27 |
| `npm run test:rules`   | ☐ Not needed: no rules change                                                                                                                                                                            |
| `npm run e2e:firebase` | ☐ Not needed: no rules or data change                                                                                                                                                                    |
| `npm audit --omit=dev` | ✔ no dependency added                                                                                                                                                                                    |
| Sonar, Lighthouse      | ☐ Not run (Sonar needs its token; the public site didn't change)                                                                                                                                         |

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                                     | Result                                                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A ✦ chip in each text field's corner, quiet until the field is in use                 | ✔ `ai-assist.component.spec.ts`; screenshots of the menu on three sizes, checked by eye                |
| The chip or Ctrl J / ⌘ J opens a menu: first version, the five rewrites, or a photo   | ✔ `ai-assist`, `ai-menu`, `ai-choices` specs; e2e (a first version from Ctrl J; a photo's description) |
| A ring and shimmer while writing; the suggestion arrives word by word within 1.5 s    | ✔ `ai-assist`, `ai-suggestion`, `ai-choices` specs (the delays, a long answer)                         |
| Use this, Try again, Discard; Undo for 8 seconds                                      | ✔ `ai-assist.view-model.spec.ts` (Undo kept, then dropped); e2e (Use this, Undo, Discard)              |
| A failure says why and leaves the field                                               | ✔ unit and e2e                                                                                         |
| Screen readers: the chip described by its field, a menu, "Suggestion ready" said once | ✔ unit; axe with the menu open and with a suggestion, three sizes                                      |
| Reduced motion: still                                                                 | ✔ every animation is inside `prefers-reduced-motion: no-preference`; e2e runs with reduced motion      |
| Fits every theme                                                                      | ✔ only theme tokens; axe on three sizes                                                                |

## Known gaps

- **Found after release:** on a wide screen, opening the menu could slide the whole editor up, leaving a blank space
  below. Screen-reader-only text stretched the page, and the menu's scroll into view moved it. Fixed in 2.14.0
  ([0030](../0030-admin-usability/03-construction.md), increment 0), with a test.
- **Word-by-word arrival isn't streaming:** the function still answers at once (D1).

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
