# 01 · Inception — Site and editor polish (1.10.0)

The first release of the [version 2 programme](../0014-version-2/01-inception.md), which holds the problem, user stories and
acceptance criteria. This file only records what 1.10.0 takes from it.

## Scope

| Item | Feature                                                                                       |
| ---- | --------------------------------------------------------------------------------------------- |
| V14  | Reorder lists easily (shows, experiences, team, videos, gallery); the featured item first     |
| V15  | Fold less important home sections, configurable per section for phones and desktop            |
| V16  | A smaller drum circle section: one picture, compact tags, the proposal button beside the text |
| V17  | Clearer WhatsApp and Call buttons, with a short attention animation like the chat's           |

## Acceptance criteria for this release

- [ ] Given a list of shows, experiences, team members, videos or photos, when the owner drags an item or presses Move up or
      Move down in its Order list, then the site shows the new order after publishing, on the home page too.
- [ ] Given a featured show or experience, when the Order list shows, then it's first and marked, and it can't be moved below
      the others.
- [ ] Given Our philosophy and Good to know, when the home page opens on desktop or a phone, then they show a heading with
      **Show more**; given the other foldable sections, then they're folded on phones only.
- [ ] Given a folded section, when Find on page searches for its text, then the browser opens it.
- [ ] Given Sections & pages, when the owner changes a section's folding, then the site follows after publishing.
- [ ] Given the drum circle section, then it shows one picture on the right and, on the left, the About text, smaller tags and
      Request proposal; on phones the picture comes first, then the text.
- [ ] Given the page, then the WhatsApp and Call buttons meet 3:1 contrast and animate a few times, then rest; with reduced
      motion they don't move.
- [ ] Given the public pages, when measured, then the initial download stays under its 500 kB warning.

---

**Approval:** ☑ Approved as part of the 0014 programme by Ravi Akhouri on 2026-11-17. The details are decided with the
[design](02-design.md).
