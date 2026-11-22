# 01 · Inception — AI help that feels good to use (2.13.0)

## Problem / goal

AI help (0025, 2.7.0) works, but it looks wrong. Every text field has a full-width **AI help** button under it, so a
card like Hero shows a column of identical outlined buttons, each as loud as the field it belongs to. The menu
opens as a row of more buttons, "Writing…" is a line of plain text, and the suggestion appears all at once in a box
of three more buttons. Nothing tells you something is happening, and nothing makes it pleasant.

**Goal:** AI help that sits quietly where you write, shows clearly when it's working, and makes taking a suggestion
feel smooth and safe. The approved prototype, **[Taal Yatra AI help](https://claude.ai/artifact/6VXWWhFcYLLDDUQ2J7v232)**
(2026-11-23), is the target. The AI itself, what it's asked and what it may write don't change: this is the admin's
look and behaviour only. No change to the public site, the rules or the Azure function.

## User stories

- **As the owner, I want AI help to stay out of the way** until I'm working in a field, so the editor looks calm.
- **As the owner, I want to see what the AI can do for this field** in one small menu: a first version when it's
  empty, the five rewrites when it has text, a description for a photo.
- **As the owner, I want to see that the AI is writing**, and to watch the suggestion arrive.
- **As the owner, I want to compare the suggestion with mine and take it or leave it**, and to undo it if I change my
  mind.
- **As a keyboard or screen-reader user, I want all of it to work without a mouse**, and to be told when the
  suggestion is ready.
- **As someone who asks for less motion, I want it still and simple.**

## Acceptance criteria

- [ ] Given a text field with AI help, then a small **✦** chip sits in its bottom-right corner (inside the field),
      quiet until the field is hovered or focused, when it shows **Write** (empty), **Improve** (has text) or
      **Describe** (a photo's description). On touch screens it always shows its word.
- [ ] Given the chip is clicked, or **Ctrl J** (**⌘ J** on a Mac) is pressed in the field, then a menu opens under
      it: **Write a first version**; or **Clearer**, **Shorter**, **Warmer**, **More formal**, **Fix spelling and
      grammar**; or **Describe the photo**. Arrow keys move, Enter chooses, Esc closes and returns to the chip.
- [ ] Given a choice, then a slow ring of colour turns around the field, the chip's sparkle twinkles, and a
      shimmering placeholder opens under the field until the answer arrives.
- [ ] Given the answer, then it writes itself in word by word under the field, finishing within about 1.5 seconds
      however long it is, with its length against the field's limit and the owner's own text struck through beside it.
- [ ] Given **Use this**, then the field takes the suggestion with a soft flash, and **Undo** stays for 8 seconds
      to bring back the owner's text. **Try again** asks again; **Discard** closes it and changes nothing.
- [ ] Given a failure, then the message says what went wrong in place of the suggestion, and the field is untouched.
- [ ] Given a screen reader, then the chip is "AI help for <field>", the menu is a menu, and "Suggestion ready"
      with its text is announced once, not word by word.
- [ ] Given reduced motion (the device's setting), then there's no ring, twinkle, shimmer or word-by-word: the
      suggestion simply appears.
- [ ] Given any of the 16 themes and the owner's own, then the chip, menu, ring and suggestion use the theme's
      colours and stay readable (axe passes).
- [ ] Given AI help isn't set up, then nothing shows, as today.

## Units of work

1. **The chip and its menu**, inside the field (text, long text, photo description), with the shortcut.
2. **The writing state:** the ring, the twinkle and the shimmer.
3. **The suggestion:** word-by-word arrival, the comparison and length, Use this, Try again, Discard.
4. **Undo**, for 8 seconds after Use this.
5. **Reduced motion, screen readers, the themes**; e2e and visual checks on three sizes.

## Decisions (recommendations; please confirm or change)

| #   | Question                                    | Recommendation                                                                                                                                                                                            |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Word by word, or true streaming**         | **Word by word in the admin.** The function returns the whole answer at once; true streaming would change the Azure function and how it's called. The answer is short, so the difference isn't visible    |
| D2  | **Your own instruction** ("mention Diwali") | **Not now.** It needs a new request type in the function, and the five rewrites cover most needs. A later release can add a box at the end of the menu                                                    |
| D3  | **The shortcut**                            | **Ctrl J / ⌘ J**, as in the prototype, only while a field with AI help has focus. Chrome uses Ctrl J for downloads elsewhere; inside the field the admin takes it. The e2e tests check it in each browser |
| D4  | **The ring's colours**                      | **From the theme:** its accent and two neighbouring colours, so it fits all 16 themes and the owner's own, never a fixed rainbow                                                                          |
| D5  | **Undo**                                    | **8 seconds**, as in the prototype; after that, the draft's own **Undo changes** still brings the published text back                                                                                     |
| D6  | **Release**                                 | **2.13.0.** The content programme's next two move up one: hiding an item becomes 2.14.0, the festival animations 2.15.0                                                                                   |

## Risks & open questions

- **Component style budget (4 kB each):** the chip, menu and suggestion are three components, each with its own
  styles, to stay inside it.
- **Long fields:** the chip sits inside the field, so the field keeps room for it (padding at its end) and the text
  never runs under it.
- **Lists of short fields** (a list of words, quick questions): each item is a field with its own chip; hidden until
  used, they don't crowd the list.
- **Tests:** today's AI help tests (`admin-ai-help.e2e.ts`, the components' specs) name the old buttons; they're
  rewritten for the new ones.
- **First download:** unchanged; all of this is in the admin.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23, with D1–D6 as recommended.
