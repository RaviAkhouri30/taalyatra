# 03 · Construction — Drum circle editor and gentle reveal (1.9.0)

Parts 2 and 3 were built first, on the owner's request of 2026-11-17, and merged by the owner (#33) after trying them
locally. Part 1 (the drum circle editor) followed the design's approval the same day.

| #   | Increment                   | Files                                                                                                                                                            | Tests                                                                                                | Notes                                                           |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Gentle reveal               | `shared/directives/reveal.directive.ts`, `shared/constants/reveal.constants.ts`, `home-page.component.*`                                                         | `reveal.directive.spec.ts`, `home-reveal.e2e.ts`                                                     | 17 deferred sections; not the assistant                         |
| 2   | Links land on their section | `features/home/section-hold.service.ts`, `home-page.view-model.ts`, `styles/_base.scss`                                                                          | `section-hold.service.spec.ts`, `home-page.view-model.spec.ts`, `home-reveal.e2e.ts`                 | Smooth scrolling removed; the hold lives in the home chunk      |
| 3   | Preview follows scrolling   | `admin/directives/in-view.directive.ts`, `editor-page.component.*`, `editor-page.view-model.ts`, `editor-nav.constants.ts`                                       | `in-view.directive.spec.ts`, `editor-page.view-model.spec.ts`, `admin-editor.e2e.ts`                 | 250 ms pause before following                                   |
| 4   | Preview fades and holds     | `preview-frame/preview-scroller.ts`, `preview-frame.component.ts`                                                                                                | `preview-scroller.spec.ts`, `preview-frame.component.spec.ts`                                        | Reload without `#section`; hidden until it has jumped           |
| 5   | Test helpers                | `shared/testing/motion-stubs.ts`                                                                                                                                 | (used by the specs above)                                                                            | jsdom has no Web Animations, `matchMedia` or observers          |
| 6   | Drum circle editor          | `admin/schemas/drum-circle.sections.ts`, `editor-tabs.ts`, `content-path.enum.ts`, `image-aspect.constants.ts`, `content-limits.constants.ts`, `firestore.rules` | `drum-circle.sections.spec.ts`, `editor-tabs.spec.ts`, rules tests (147), `admin-drum-circle.e2e.ts` | Four cards on one document; facts and pictures fixed at 4 and 3 |

## Decisions & deviations from design

- **The reveal waits for content.** Sections are created empty, near the top, before their data arrives; deciding then saw
  every section as "in view", so nothing was ever hidden. Found by measuring in a real browser.
- **Hidden by opacity only.** Holding the rise while hidden moved a linked section down by the rise, and a link landed
  that far off. The rise now plays only while revealing.
- **A bug that predates this release:** links to a home section (`/#contact`, and "Request proposal" from other pages) landed
  up to 11,000 px short, because the sections above filled in during the smooth scroll. Fixed by Part 3's jump-and-hold.
- **Slower reveal, at the owner's request:** 1 s and a 40 px rise with a soft ease-out, instead of 600 ms and 24 px.
- **The preview follows scrolling only beside the form.** On phones and tablets it sits behind a switch at the top of the
  form, so scrolling back up to the switch took it to the first card; there it shows the last card worked in. A thin
  reading line (30 % down the screen) replaced the top-35 % band, which could hold two cards at once.
- **The preview's jump scrolls only the site's own window.** `scrollIntoView` also scrolled the editor's panels around the
  frame and set off "ResizeObserver loop" warnings.
- **Four cards, not one.** The drum circle section has 16 fields; one card would be a long scroll. The four cards share
  `home/drumCircle` and each edits its own keys, as the editor already supports.
- **No `WINDOW` token.** CLAUDE.md lists one, but the code has never had it; the new code uses the global observers and
  `DOCUMENT.defaultView`, like the existing code.
- **CLAUDE.md §13** gains the owner's rule: never push automatically; the owner reviews and tests locally first.

---

**Approval:** ☐ Pending
