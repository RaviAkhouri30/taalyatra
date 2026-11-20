# 01 · Inception — Editable theme (2.2.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V19, added by the owner on 2026-11-19. The theme changes
the public site and the signed-in admin alike.

## Problem / goal

The site's look is fixed in code: 29 colours in `_tokens.scss`, two fonts in `index.html`, and about 15 more colours written
straight into a few components (the chat panel, the offer's drawing, the footer map, the video play button). Changing any of
them needs a developer and a deploy. The owner wants to change the colours, background, text and fonts from the admin, as a
theme, with drafts and preview like any other content, and without being able to publish a look that some visitors can't read.

## User stories

- **As the owner, I want to pick a ready-made theme** (today's warm night look, a light one, a festive one, a high-contrast
  one) and publish it, so the site can change for a season or an event without a developer.
- **As the owner, I want to adjust a theme's colours, background, text size and fonts**, and see the result in the preview
  before anyone else does.
- **As the owner, I want the admin to stop me publishing a theme that is hard to read**, and tell me which colours to change.
- **As a manager given the Theme page, I want to change the theme** with my changes waiting for the owner's approval, as on
  any other page.
- **As a visitor, I want the site to look the same on every page**, load as fast as today, and stay readable.

## Acceptance criteria

- [ ] Given the Theme page, then the owner can choose one of the ready-made themes or set its colours, background, text size
      and font pair; the preview shows the draft theme across the whole site before it's published.
- [ ] Given a published theme, then every page of the public site and of the admin uses it: no colour or font is left
      written in code outside the default theme.
- [ ] Given a theme where a text colour on its background is below 4.5:1, or a button, field edge or focus ring below 3:1
      (WCAG 2.2 AA), then the Theme page names the pair and its ratio, and the theme can't be published or sent for approval.
- [ ] Given a missing, unreadable or invalid theme, then the site shows today's look, as with the visibility switches
      (ADR-0015): a bad write can't make the site unreadable.
- [ ] Given a manager with the Theme page on Team access, then their changes follow the usual drafts and approval; a manager
      without it doesn't see the page; the rules check both.
- [ ] Given **Reset to the default theme**, then one click puts today's look back as a draft.
- [ ] Given each ready-made theme, then axe finds no WCAG 2.2 AA violations on the home page and one admin page, on all
      three sizes; screenshots of each are kept as baselines.
- [ ] Given today's look, then nothing changes visually (every existing screenshot baseline passes unchanged), the public
      site's first download stays within its budget, and there's no layout shift when a theme applies (CLS < 0.1).

## Units of work

1. **Colours become CSS variables, with no visible change:** each colour token becomes a `var(--…)` whose default is
   today's value; the colours written into components move into the tokens; shades such as borders and raised surfaces are
   worked out from the main colours (`color-mix()`). All existing screenshots must still pass.
2. **Theme model:** the theme's fields, the ready-made themes, working out the shades, and the contrast check for each pair
   of colours that's used together. Plain classes, fully tested.
3. **Storage and rules:** `site/theme` in the `site` collection, which is already loaded with the first page, so it costs no
   extra request. Drafts, preview, approval and history work as for any document. The rules check the theme's shape:
   colours as `#rrggbb`, and fonts and sizes from fixed lists.
4. **Applying it:** the theme sets the variables on the page for the site and the admin. A chosen font loads only when it
   isn't the default. The last theme seen is remembered on the device, so a returning visitor sees it before the first paint.
5. **Theme page in the editor:** the ready-made themes, colour fields with their contrast results beside them, background,
   text size, font pair, and Reset. It joins the menu, Team access page permissions, the tour and the Features page.
6. Tests (unit, rules, e2e on three sizes with axe and a screenshot per ready-made theme), ADR-0019, diagrams, records,
   CHANGELOG, release 2.2.0.

## Decisions for the owner

| #   | Decision                         | Recommendation                                                                                                                                                                                                                                                               |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Which colours you set**        | **Six:** background, cards, text, quiet text, accent and second accent. The other 23 (borders, raised surfaces, hovers, the header's glass) are worked out from these, so they always match. Setting all 29 by hand would be slow and easy to get wrong                      |
| D2  | **Fonts**                        | **A short list of font pairs** (headings plus body text), about six including today's, each with a fallback sized to match so the page doesn't jump when it loads. Not any Google font: each new font needs that measured fallback and costs speed                           |
| D3  | **Text styles**                  | **Text size in three steps** (smaller, standard, larger) and **heading weight in two** (bold, extra bold), applied to the whole site. Not per-element styles: they'd break the design's balance and its screen-size layouts                                                  |
| D4  | **Background**                   | **A plain colour or a soft gradient** between two of the theme's colours. Not a picture: its contrast with text can't be checked, and it would slow the first paint                                                                                                          |
| D5  | **Ready-made themes**            | **Four:** Warm night (today's), Daylight (light), Festival (marigold and deep red) and High contrast. Each can be adjusted afterwards                                                                                                                                        |
| D6  | **Who may change it**            | **A Theme page like any other editor page:** the owner, plus managers given it on Team access, whose changes wait for approval. Nothing new to learn and no new kind of permission                                                                                           |
| D7  | **A first visit after a change** | **Remember the theme on each device**, so a returning visitor sees it at once. A first-time visitor may see today's colours for a moment while the site's data loads, with no layout shift. Holding the page until the theme arrives would slow the first paint for everyone |
| D8  | **The admin's look**             | **The admin follows the theme**, as V19 asks, but its warning and error colours stay fixed, so they always look like warnings. Reset to the default theme is always one click away, so a poor choice can't lock anyone out of the admin                                      |

## Risks & open questions

- **A light theme exposes places that assume a dark page** (shadows, image overlays, the logo's ground, the drawings).
  Mitigation: unit 1 moves every colour into the tokens first, and a screenshot per ready-made theme catches the rest.
- **Speed:** CSS variables cost nothing measurable, but a non-default font adds one download. Mitigation: only the chosen
  pair loads, with sized fallbacks (D2); Lighthouse is run on Daylight before release.
- **Rules and data change:** `npm run test:rules` and `npm run e2e:firebase` are needed, and the rules must be deployed
  with the release (by the owner, as before).
- **Size (L):** if it grows, fonts and text styles (D2, D3) can move to 2.2.1, so colours, background and the ready-made
  themes ship first.
- **Out of scope:** the logo and images, per-section colours, layout changes and custom CSS.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20, with D1–D8 as recommended.
