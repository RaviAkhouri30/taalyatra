# 02 · Design — Site and editor polish (1.10.0)

## V14 · Reorder lists

### Today

Every editor list already has Move up, Move down and Remove on each item. But a show or a team member is a long form, so on
the Shows tab the seven items take several screens, and the move buttons sit a screen apart. Reordering works; it just isn't
findable.

### Design

- **An Order panel** at the top of each collection list, listing the items by name (shows and videos by title, experiences
  and team by name, photos by a thumbnail and description), with a drag handle and Move up / Move down on each.
- **Items fold.** Below the panel, each item is a folded row with its name; it opens to edit. A newly added item opens.
- **Featured first.** In lists with a featured item (shows, experiences), it's pinned at the top of the Order panel with a
  star, and can't be dragged below the others. Switching Featured on for another item moves the star and the pin.
- **The site follows the order everywhere.** Lists already save their order (collections as `order`, experiences as the
  array's order), and the home page and the item pages read it. The only rule change on the site: the shows teaser on the home
  page and the Shows page already put the featured show in the spotlight, and the rest in the saved order.

Built once, in the schema-driven editor (ADR-0014): a list opts in with `sortable: { titleKey, thumbnailKey? }`, so every list
that should have it gets it from its schema.

### Dependency: `@angular/cdk` (drag and drop)

**Why:** dragging with touch and mouse, with auto-scroll and accessible handles, is a lot to write well. The CDK is Angular's
own library, versioned with Angular. It's imported only by the editor, which is lazy-loaded, so the public site's download
doesn't change. Keyboard users keep the Move up / Move down buttons, which the CDK doesn't replace. Installed with
`--save-exact` at the version matching Angular 22.

## V15 · Fold less important sections

### Behaviour

- A folded section shows its eyebrow and title, and a **Show more** button (`aria-expanded`). Pressing it opens the section in
  place; **Show less** folds it again.
- The content stays in the page with `hidden="until-found"`, so search engines read it and **Find on page opens it**. Browsers
  without `until-found` treat it as `hidden`; the button still works.
- No layout jump after loading: the folded state is decided when the section renders, which is already after the first screen
  (the sections are deferred).

### Defaults and the owner's control

| Section            | Default                      |
| ------------------ | ---------------------------- |
| Our philosophy     | Folded on phones and desktop |
| Good to know (FAQ) | Folded on phones and desktop |
| Where we play      | Folded on phones             |
| How it works       | Folded on phones             |
| Proof in the room  | Folded on phones             |
| From our circles   | Folded on phones             |
| Everything else    | Never folded                 |

In **Sections & pages**, each of these gets a choice: _Never_, _On phones_, _On desktop_, _Always_. Stored in
`site/visibility` as `folded: { <section>: 'never' | 'phone' | 'desktop' | 'always' }`; a missing value means the default
above. **Rules change:** `isValidVisibility` accepts the `folded` map, its keys from `HomeSection` and those four values only,
tested on the emulator. The rules must be deployed **before** merging.

### How it works

A shared `FoldComponent` (`<app-fold>`) wraps a section's body, below its heading. Each foldable section's template puts its
body inside it; the heading stays outside, so the page's heading structure doesn't change. "Phone" means the site's phone
breakpoint (≤ 620 px), read with `matchMedia` through `DOCUMENT.defaultView` and followed on resize.

## V16 · A smaller drum circle section

- **Layout:** two columns on desktop. Left: eyebrow, title, the four facts, About, Objectives and Occasions (smaller tags:
  13 px, tighter padding), then **Request proposal**. Right: **one picture**, the same height as the text column, cropped to fit.
  Phones: the picture first, then the text. The session flow stays below it; on phones it folds behind Show more, using the same
  fold as V15.
- **Data:** the stored `gallery` stays a list, so nothing in the database changes; the site shows its first picture. The editor's
  Pictures card becomes one picture field, through a section view that reads and writes `gallery[0]`. The two other stored
  pictures are dropped the first time the card is saved.
- **Crop:** 4:5 (portrait), to suit the right half beside the text on desktop.

## V17 · Floating buttons

- **Colours:** WhatsApp green background with a dark icon (about 9:1), Call amber with a dark icon; both have a thin light
  ring so they stand out from dark sections. Every pair passes WCAG's 3:1 for controls. New tokens in `_tokens.scss`.
- **Animation:** like the chat icon's, each button gets a short attention movement (WhatsApp: a ring pulse; Call: a small
  ring-shake). They play **three times, staggered, after the buttons appear, then rest.** The chat icon's endless animation
  gets the same treatment: content that moves for more than 5 seconds needs a way to stop it (WCAG 2.2.2), and resting after a
  few seconds meets that. Nothing moves with reduced motion.
- **Pages without the chat** (the inner pages) have the lone WhatsApp button; it gets the same colours and animation.

### The initial download

The lone WhatsApp button is part of the site shell, so it's in the initial download, which has 120 bytes to spare. It moves
into a `@defer (on idle)` block: it isn't needed for the first screen, and that frees room rather than using it. The chat
launcher's stylesheet is close to the 4 kB per-component limit, so the floating buttons' styles move into their own small
component.

## Testing

- **Unit:** the Order panel (drag result, move buttons, featured pinned and immovable); folded state per breakpoint and per
  setting, `until-found`, button and `aria-expanded`; the drum circle view (`gallery[0]` in and out); the visibility model's
  defaults for `folded`.
- **Rules:** `folded` accepted with known keys and values; unknown keys or values refused.
- **E2E (three screen sizes):** reorder shows with the Order panel, publish, and see the order on the home page and the Shows
  page; a folded section opens with Show more and through Find on page; the drum circle layout; floating buttons visible, with
  axe 0 violations. Screenshots updated where the layout changes (approved by the owner).
- **Speed:** initial download under 500 kB; Lighthouse on mobile and desktop compared with 1.9.0.

## Decisions (recommendations)

| #   | Decision                          | Recommendation                                                                                   |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Drag and drop                     | `@angular/cdk`, editor only (above)                                                              |
| 2   | Which sections fold, and where    | The defaults table above, changeable per section in Sections & pages                             |
| 3   | The drum circle picture's shape   | 4:5 portrait                                                                                     |
| 4   | The chat icon's endless animation | Make it rest after three plays, like the new ones (WCAG 2.2.2)                                   |
| 5   | Visual changes                    | Screenshots of each change go into the construction record for the owner to approve before merge |

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-17, with decisions 1–5 as recommended.
