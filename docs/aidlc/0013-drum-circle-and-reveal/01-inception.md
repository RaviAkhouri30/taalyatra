# 01 · Inception — Drum circle editor and gentle reveal (1.9.0)

Two small, visible changes the owner asked for on 2026-11-17, released together as 1.9.0.

## Problem

1. **The drum circle pictures can't be changed.** The "Drum circle details" section (`home/drumCircle`) isn't in the editor.
   Its three pictures and all its text are still the original placeholders, so only a developer can change them.
2. **Scrolling feels rough.** The owner said the scroll "is not so smooth". A production build scrolled top to bottom showed
   almost no stutter (0 frames over 50 ms at normal speed, 1 at 50 ms with a 4× slower processor; worst frame 33 ms and 50 ms).
   What feels rough is that sections and pictures appear abruptly as they arrive, not that the page stutters.

## Release plan (renumbered)

| Version | Contents                                                                                     | Record |
| ------- | -------------------------------------------------------------------------------------------- | ------ |
| 1.9.0   | This record: drum circle editor, gentle reveal                                               | 0013   |
| 1.10.0  | The rest of the content programme: festival themes, SEO settings, hiding items, other images | 0010   |
| 1.11.0  | Proposals inbox and account                                                                  | 0011   |

## User stories and acceptance criteria

- As the owner, I want to edit the drum circle section like the others, so I can use real photos and wording.
  - [ ] Given the editor, when I open **Music & creativity**, then I see **Drum circle details** with every field the section
        shows: headings, the four facts, the About paragraphs, objectives, occasions, button label, the three pictures, similar
        experiences and the session flow.
  - [ ] Given a picture, when I choose or upload one, then I can crop it and must describe it, as everywhere else.
  - [ ] Given my changes, when I publish or undo, then they behave like every other section.
  - [ ] Given a picture used here, when I try to delete it from the library, then the library says it's in use.
- As a visitor, I want the page to feel smooth as I scroll.
  - [ ] Given a section below the first screen, when it first scrolls into view, then it fades in and rises slightly.
  - [ ] Given the first screen, when the page opens, then nothing waits for an animation, and load speed doesn't change.
  - [ ] Given my device asks for reduced motion, when I scroll, then nothing animates.
  - [ ] Given a link to a section, such as **Request proposal**, when I follow it, then the section is shown, already
        revealed or revealing as it arrives.

## Out of scope

- A smooth-scrolling library that takes over the browser's scrolling. See the design, decision 3.
- Making the other remaining sections editable. That stays in 1.10.0.

## Units of work

1. Drum circle editor section, its rules entry and tests.
2. Reveal directive, applied to the home page's sections below the first screen, with tests.
3. Docs, a check of the initial download size and Lighthouse, and the release.

## Risks

- **Hidden content if the reveal fails.** A section that never gets its "in view" signal would stay invisible. See the design.
- **The initial download is 100 bytes under its 500 kB warning.** Both changes must load only with the home page or the editor.

---

**Approval:** ☐ Pending
