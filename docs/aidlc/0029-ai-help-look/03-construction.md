# 03 · Construction — AI help that feels good to use (2.13.0)

Built on the approved [inception](01-inception.md) and [design](02-design.md).

| #   | Increment              | Files                                                                                                                                                                                            | Tests                                                                                                                                                                                  |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Choices and the menu   | `ai-choices.ts` (the choices, the chip's word, the timings, the words' delays, the shortcut); `AiMenuComponent`; the old style list left `ai-assist.ts`                                          | `ai-choices.spec.ts`; `ai-menu.component.spec.ts` (name, ↑ ↓ Home End, Esc and Tab, a choice)                                                                                          |
| 2   | The chip in the field  | `AiAssistComponent` wraps the field (`ng-content`), with the chip, Ctrl J / ⌘ J and a press elsewhere; `schema-field` and `image-field` project into it and pad for the chip; `AiSparkComponent` | `ai-assist.component.spec.ts` (18): the field inside, the chip's word, the shortcut, the menu, nothing until set up; `schema-field.component.spec.ts`; `ai-spark.component.spec.ts`    |
| 3   | Writing and suggestion | the ring and twinkle (`ai-assist.component.scss`); `AiSuggestionComponent` (shimmer, words arriving, length, yours, actions); `RevealDelayDirective`                                             | `ai-suggestion.component.spec.ts`, `reveal-delay.directive.spec.ts`; the ring and shimmer while writing, "Suggestion ready" said once                                                  |
| 4   | Undo                   | `AiAssistViewModel.undo`, `used()`, `dropUndo()` (an RxJS `timer`)                                                                                                                               | `ai-assist.view-model.spec.ts`: kept for 8 seconds, dropped when taken or asked again; the component's Undo                                                                            |
| 5   | E2E and records        | `admin-ai-help.e2e.ts` rewritten; component tree, sequence diagram, CHANGELOG                                                                                                                    | Use this, Undo, Discard, a first version from Ctrl J, a failure, a photo's description; screenshots of the menu and a suggestion; axe with the menu and with a suggestion; three sizes |

## Decisions & deviations from design

- **The chip is named "AI help", and described by "For _field_"**, as before. With the field's label in its name,
  `getByLabel` (and screen readers looking for a field by its label) found two things for every field.
- **A sparkle of the admin's own** (`AiSparkComponent`): the site's sparkle icon reads as a sun at this size, and
  adding the prototype's to the site's icon set would grow the first download (0.06 kB left).
- **The menu and suggestion scroll themselves into view**, with room for the editor's sticky publish bar: the first
  screenshots showed the bar covering them when the field sat low on the screen.
- **The word delays are a directive's host binding** (`RevealDelayDirective`): templates may not set styles.
- **Try again uses the outlined button**, like Discard; the lighter style read as disabled on the dark themes.
- **Unit tests stub `scrollIntoView`**, which jsdom doesn't have.
- **The first download didn't change** (509.94 kB); the build has no style-budget warnings.
- **No dependency added.**

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
