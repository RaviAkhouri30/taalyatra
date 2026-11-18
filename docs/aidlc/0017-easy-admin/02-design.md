# 02 · Design — An admin anyone can use (1.11.0)

From the [admin usability review](../0014-version-2/admin-usability-review.md) (problems 1, 3–7), which the programme's V6
covers. The owner asked for U1–U6 to be built next, ahead of backups (2026-11-18). Click-to-edit in the preview and the drum
circle's own tab (review problems 2 and 8) shipped just before, and are part of this release.

## Release plan (renumbered again)

| Version | Contents                                                     | Record |
| ------- | ------------------------------------------------------------ | ------ |
| 1.11.0  | This record: the admin made easy (U1–U6), plus click-to-edit | 0017   |
| 1.12.0  | Backups, going back to a publish, safety copy, what's new    | 0016   |
| 1.13.0  | Visit graphs and the Leads page                              | —      |
| 2.0.0+  | Unchanged order: roles, tour, AI, phone app                  | 0014   |

## U1 · A menu that mirrors the website

| Group         | Entry (route)                        | Cards (unchanged ids)                                |
| ------------- | ------------------------------------ | ---------------------------------------------------- |
| **Home page** | Hero (`hero`)                        | Hero (with audience tags and the game link)          |
|               | Offer (`offer`)                      | Offer switch and dates, Offer section                |
|               | Who it's for (`audiences`)           | Who it's for heading                                 |
|               | Experiences (`experiences`)          | Heading, experience cards                            |
|               | Shows (`shows`)                      | Heading, show formats                                |
|               | Drum circle (`drum-circle`)          | The four drum circle cards                           |
|               | Rhythm game (`rhythm-game`)          | Rhythm game heading                                  |
|               | Videos (`videos`)                    | Videos heading (moved from Page content), video list |
|               | Gallery (`gallery`)                  | Heading, photos                                      |
|               | Team (`team`)                        | Team heading (moved from Page content), team members |
|               | Proposal form (`proposal-form`)      | Plan your session heading                            |
| **Settings**  | Business details (`business`)        | Site details (name, tagline, description)            |
|               | Contact & social links (`contact`)   | Contact details, social profiles                     |
|               | Show or hide sections (`visibility`) | Sections, pages, buttons on every page, folding      |
|               | Photo library (`media`)              | (the library)                                        |
| **Publish**   | Review & publish                     |                                                      |

- "Page content" goes; its cards move to the section they belong to. `/admin/content` redirects to `/admin/hero`, so old
  links and bookmarks still work.
- Card ids, document paths and drafts don't change: only which tab shows a card.

## U2 · Find

A **Find** box at the top of the side panel. Typing searches every tab, card and field label (and a few everyday words, such as
"Diwali" for the offer and "phone" for contact details) and lists up to eight matches, each as "Field — Card · Tab". Choosing
one opens the tab and scrolls to the field, focusing it, or to the card for lists. Keyboard: Tab through results; Escape
clears. The same jump is used by the preview's click-to-edit.

## U3 · A to-do list you can click

The dashboard's "Placeholders to replace" becomes **"Still to fill in"**: each item reads "Offer → Offer card 1 → Duration
and price", says what to do in plain words ("Still says “[Add duration & price]”: replace it with your own words."), and has
a **Fix** link to its card. The dashboard's other cards use the same plain wording, and gain links that go straight to the
section.

## U4 · Plain words

| Today                   | New                            |
| ----------------------- | ------------------------------ |
| Discard / Yes, discard  | Undo changes / Yes, undo them  |
| Unpublished changes     | Changes not on the website yet |
| Placeholders to replace | Still to fill in               |
| Sections & pages        | Show or hide sections          |
| Site-wide               | Buttons and bars on every page |
| Media library           | Photo library                  |
| Spotlight text          | Featured box                   |
| Featured card           | Featured box                   |
| Load speed report       | Show the speed report          |

## U5 · Quieter forms

- **Character counters only near the limit:** shown from 80 % of a field's maximum, or when over its recommended length.
- **Flatter cards:** a group inside a card (such as "Brand") loses its border and becomes a small label; lists keep theirs.

## U6 · Phones

- **One-row top bar:** the email address and Sign out move into the side panel (opened with Menu) on phones.
- **Preview in the bottom bar:** on phones the Show preview / Back to editing switch moves from the top of the form into the
  publish bar, so it's always in reach.

## Second walkthrough (after U1–U6)

Done at the owner's request, as a first-time, non-technical owner, on desktop (1440 px and 1280 px) and phone (390 px).

**Better:** the menu reads like the website; a section's heading and content are on one page; Find answers "phone", "about"
and "Diwali"; the dashboard says what's left in plain words and links to it; forms are quieter; the phone top bar is one row.

| #   | Found                                                                                                                                                                                                  | Fix                                                                                                   | Status          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------- |
| F1  | Find was noisy: "about" listed every drum circle field, because the tab's everyday words matched all of them                                                                                           | Everyday words match the section only; fields match on their own names                                | ✔ Fixed         |
| F2  | On a laptop screen, "Review & publish" fell below the bottom of the menu                                                                                                                               | Moved straight under Dashboard                                                                        | ✔ Fixed         |
| F3  | The dashboard put the speed report before the to-do list, and still said "widget"                                                                                                                      | To-do list first; "every section, page and button"                                                    | ✔ Fixed         |
| F4  | 54 things "still to fill in" in one long list felt like a wall                                                                                                                                         | Grouped by section ("Team · 12 to fill in"), opened one at a time                                     | ✔ Fixed         |
| F5  | On phones, the floating "Show preview" button sat on top of form text                                                                                                                                  | Moved into the publish bar, beside Publish                                                            | ✔ Fixed         |
| F6  | In "Show or hide sections", some names didn't match the website ("Our story", "Cities", "FAQ")                                                                                                         | The website's own headings: "Our philosophy", "Where we play", "Good to know (questions)", …          | ✔ Fixed         |
| F7  | A folded panel hid Find completely                                                                                                                                                                     | A search button in the folded panel opens it with the cursor in Find                                  | ✔ Fixed         |
| F8  | A tab with one card repeats its name ("Hero" page, "Hero" card)                                                                                                                                        | Hide the card heading when a tab has one card (keep it for screen readers)                            | Later (2.1.0)   |
| F9  | The sections on the home page that the editor can't change yet (Our philosophy, Where we play, How it works, Proof, Good to know) have no menu entry, so an owner looks for them and doesn't find them | Their editors come with the content programme; until then, a line in the menu: "More sections coming" | Later (content) |
| F10 | First-time owners still meet "draft" and "publish" without explanation                                                                                                                                 | The guided tour (V9)                                                                                  | Later (2.1.0)   |

## Testing

Unit tests for the new tab map, the redirect, Find's index and matching, the to-do links, the counter rule; e2e on all three
screen sizes updated for the new names, plus Find and the to-do links; screenshots of the new menu, dashboard, a quieter card
and the phone layout for the owner before merging.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18 ("implement u1 to u6", after the usability review's recommendations).
