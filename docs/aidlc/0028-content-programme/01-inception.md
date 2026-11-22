# 01 · Inception — The rest of the content (2.10.0 onwards)

The content programme planned in 0008 as "0010 · All remaining content" and never started; the version 2 programme
placed it last ([0014](../0014-version-2/01-inception.md), "later"). Like 0014, this record covers the whole programme
once, and each release gets its own design.

## Problem / goal

Most of the site can be edited in the admin, but a large part still can't: ten home sections, the four inner pages,
the search descriptions, the chat's script and the proposal form's choices are in the data or the code, so only a
developer can change them. The owner wants to change every word visitors see, hide an item for a while without
deleting it, and pick a festival animation for each season, not only Diwali.

## What's true today (checked 2026-11-22)

| Area                                     | Editable in the admin                                                                                               | Not yet                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home sections**                        | Hero, offer, who it's for, experiences, shows, drum circle, videos, gallery, team, rhythm game and contact headings | **Philosophy, How it works, Cities, FAQ, Testimonials and clients, Instagram, the mid-page call to action, the marquee and the trust strip**      |
| **Inner pages**                          | Their lists (videos, team, show formats)                                                                            | **The pages' own copy:** Videos, Team (values), Shows (setups, process), **Achievements** (numbers, milestones, recognition, press, performances) |
| **Search and sharing**                   | The brand's name and description                                                                                    | **Each page's title and search description** (written in `app.routes.ts`); the share image (fixed in `index.html`)                                |
| **Chat assistant**                       | Nothing (the AI answers since 2.7.0, from the site's content)                                                       | **Greeting, quick replies, their answers, the fallback**                                                                                          |
| **Proposal form**                        | Its headings                                                                                                        | **Event types, group sizes, experience choices, the assurances and messages**                                                                     |
| **Rhythm game**                          | Its headings                                                                                                        | Modes, ranks, messages (low priority, 0008 D7)                                                                                                    |
| **Hiding**                               | Whole sections and pages, folding (1.10.0)                                                                          | **One item** (a video, team member, show, testimonial, FAQ, offer card, milestone, photo) without deleting it                                     |
| **Festival animations**                  | Diwali sparks, or none                                                                                              | **Holi, Navratri, Ganesh Chaturthi, Dussehra, Baisakhi, Gurpurab, Christmas, Halloween, New Year** (the design's other nine)                      |
| **Writing tips with counters** (0008 D8) | ✔ done in the editor (recommended lengths, counted as you type)                                                     | —                                                                                                                                                 |

- **The public site's first download** is 509.36 kB, with 0.64 kB left under the 510 kB warning. Editing more content
  adds admin code, which visitors never download, but hiding items and new animations change public code.
- **Everything new goes through drafts, preview, approval, history, backups and AI help**, as every page does.

## User stories

- **As the owner, I want to edit every section and page visitors see**, so I never need a developer for wording.
- **As the owner, I want each page's search title and description in the admin**, so I can improve how we show in
  Google.
- **As the owner, I want to change the chat's greeting and quick answers**, and the proposal form's choices.
- **As the owner, I want to hide one item for a while**, a show or a testimonial, and bring it back later as it was.
- **As the owner, I want a festival animation for each season's offer**, chosen when I schedule it.
- **As a manager**, the same, within the pages Team access gives me.

## Acceptance criteria (whole programme)

- [ ] Given each home section and inner page listed above, then the admin edits its words and lists, with preview,
      approval, history and backups as for every page, and the rules accept only the shape the site renders.
- [ ] Given a page's title and search description, when published, then the page's tab title, description and
      sharing preview use them; an empty one falls back to today's.
- [ ] Given a hidden item, then visitors don't see it anywhere (home page, its inner page, the chat's answers), the
      editor shows it as hidden, and showing it again brings it back unchanged.
- [ ] Given an offer with a festival animation, then the site shows that animation while the offer is live, only for
      visitors who haven't asked for less motion, and its code downloads only when it's used.
- [ ] Given the public site, then its first download stays under the 510 kB warning, and Lighthouse scores don't drop.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on every new editor page and on the site, on three
      sizes; `verify`, `e2e`, `test:rules` and `e2e:firebase` pass.

## Units of work (proposed releases)

| Version    | Contents                                                                                                                                                     | Why this order                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **2.10.0** | **The home sections:** Philosophy, How it works, Cities, FAQ, Testimonials and clients, Instagram, the mid-page call to action, the marquee, the trust strip | The largest visible gap, all on the home page; editor and rules only, so no public code changes |
| **2.11.0** | **The inner pages and search:** Videos, Team, Shows and Achievements copy (Achievements in full); each page's title and search description                   | Achievements is the only page with no editor at all; the descriptions move from code to data    |
| **2.12.0** | **The chat and the form:** the chat's greeting, quick replies and answers; the proposal form's choices, assurances and messages                              | Small, owner-facing wording; the form's choices also feed Leads' filters                        |
| **2.13.0** | **Hide one item** in every list (D4)                                                                                                                         | Changes public code and every list's rules, so it comes once the lists are all editable         |
| **2.14.0** | **The festival animations:** the nine others (D5), each loaded only when used                                                                                | New build work, one animation at a time; last, as it needs your choices and the most testing    |

Each release bumps MINOR, with its own design, records and CHANGELOG entry.

## Decisions for the owner

| #   | Decision                       | Recommendation                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Order**                      | **As above:** home sections, inner pages and search, chat and form, hiding, animations. Any release can move: tell me which matters most                                                                                                                                                                                                                               |
| D2  | **The share image (0008 I3)**  | **Leave it out of this programme.** It's in `index.html`, read by WhatsApp and Facebook before the app runs, so an admin upload would only show after the next deploy. Titles and descriptions work at once                                                                                                                                                            |
| D3  | **The sign-in page's wording** | **Stays in the code** (`pages/admin`): it's the admin's own text, and an editing mistake there could lock you out of fixing it                                                                                                                                                                                                                                         |
| D4  | **What hiding an item does**   | **A "Hidden" switch on each item** in videos, team, show formats, testimonials, FAQ, offer cards, milestones and gallery photos. The site skips it everywhere, the chat's AI never sees it, and the editor keeps it, marked "Hidden". It's still in the published data, so it isn't private: for that, delete it                                                       |
| D5  | **The festival animations**    | **The design's nine, one per festival**, each a light particle effect in the offer band like Diwali's sparks: colours for Holi, lamps for Navratri, flowers for Ganesh Chaturthi, and so on, all still for visitors who ask for less motion. **Is `taal-yatra-admin-festival-themes.xlsx` in your Downloads your list for them?** If so I'll use it in 2.14.0's design |
| D6  | **The rhythm game's wording**  | **Leave it out** (0008 D7, low priority): its modes and ranks are part of how the game plays. It can join 2.12.0 if you'd like                                                                                                                                                                                                                                         |

## Risks & open questions

- **The first download (2.13.0, 2.14.0).** Hiding items changes how the site reads every list, and only 0.64 kB is
  left. Mitigation: the check is one small shared function; the animations are separate chunks loaded with the offer.
  If it still doesn't fit, you decide between a smaller start elsewhere and raising the warning.
- **The rules grow with every section.** Each document gets a shape check, as the editable ones have. Mitigation:
  rules tests per release, `npm run deploy:rules` with each.
- **Chat answers and hidden items.** The AI answers from the site's content (2.7.0); hidden items must be left out of
  what it's sent. Covered by 2.13.0's tests.
- **Search descriptions in a single-page app.** Google reads them after the app runs, as it does today; nothing
  changes for indexing.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22, with D1–D6 as recommended; D5's list to confirm in 2.14.0's design.
