# 03 · Construction — Site and editor polish (1.10.0)

| #   | Increment             | Files                                                                                                                                                                                                                                                | Tests                                                                                                                                | Notes                                                               |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | V17 Floating buttons  | `styles/_fab.scss`, `_tokens.scss` (WhatsApp green, ring), `assistant/contact-fabs/*`, `assistant-launcher.*`, `whatsapp-fab.*`, `site-shell.component.html`                                                                                         | `contact-fabs.component.spec.ts`, `site-shell.component.spec.ts`                                                                     | Call terracotta, WhatsApp green, dark icons; three plays, then rest |
| 2   | V16 Drum circle       | `drum-circle/home-drum-circle.*`, `drum-circle.model.ts`, `admin/models/drum-circle-picture-view.ts`, `drum-circle.sections.ts`, `image-aspect.constants.ts`                                                                                         | `home-drum-circle.component.spec.ts`, `drum-circle-picture-view.spec.ts`, `drum-circle.sections.spec.ts`, `admin-drum-circle.e2e.ts` | One picture, stored as `gallery[0]`; the flow folds on phones       |
| 3   | V15 Folding           | `shared/components/fold/*`, `shared/services/viewport.service.ts`, `fold-mode.enum.ts`, `fold.constants.ts`, `site-visibility.model.ts`, `home/section-folds.ts`, `home-page.*`, six section components, `visibility.sections.ts`, `firestore.rules` | `fold.component.spec.ts`, `viewport.service.spec.ts`, `section-folds.spec.ts`, rules tests (150), `home-journeys.e2e.ts`             | `hidden="until-found"`; defaults first in each choice               |
| 4   | V14 Order panel       | `admin/components/list-order/*`, `schema-fields.*`, `forms/list-items.ts`, `i-field-schema.ts` (`sortable`), `media.sections.ts`                                                                                                                     | `list-order.component.spec.ts`, `schema-fields.component.spec.ts`, `list-items.spec.ts`, `admin-collections.e2e.ts`                  | `@angular/cdk` 22.2.3, exact; items fold to one line                |
| 5   | Preview while loading | `preview-frame/preview-scroller.ts`                                                                                                                                                                                                                  | `preview-scroller.spec.ts`                                                                                                           | Hidden until the section being edited has rendered                  |

## Screenshots for approval (design decision 5)

In [`screenshots/`](screenshots/): the drum circle on desktop and phone; Our philosophy and Good to know folded on desktop and
phone; How it works folded on phones; the floating buttons; the Order panel; the folding choices in Sections & pages. The e2e
screenshot baselines are re-recorded (`npm run e2e:visual:update`) only after the owner approves these.

## Decisions & deviations from design

- **The facts stay full width above the two columns.** The design put them in the left column; the owner's request was the
  About text, Objectives, Occasions and the button on the left beside one picture, which this follows. Four facts in a half
  column would also wrap to two rows.
- **Folding defaults live with the home page, not in the shared visibility model.** The model only hands back the stored
  value, so the initial download grows by about 100 bytes, not by the defaults and checks.
- **The lone WhatsApp button now loads after the first screen** (`@defer (on idle)`), as designed: the initial download went
  from 499.88 kB to 499.36 kB.
- **`fold.constants.ts` uses relative imports:** the rules tests import it, and their runner has no path aliases.
- **The Order panel moves an item by its current place,** not the place it had when drawn: a quick second press could land
  before the panel redrew. Found in a browser check, covered by a test.
- **Folded item headers use an icon, not a CSS arrow:** CSS text became part of the button's name for screen readers.
- **The preview stays hidden until its section loads** (not in the design): it showed a blank page for a second or two. An
  animation that ends with a fade-in is the fallback, so no timer is needed.
- **`stubMatchMedia` uses `vi.stubGlobal`:** it leaked a fake `matchMedia` into later test files and made one fail only in the
  full run.

---

**Approval:** ☐ Pending
