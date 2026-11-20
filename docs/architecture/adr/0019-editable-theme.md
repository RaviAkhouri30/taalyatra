# ADR-0019: An editable theme through CSS variables

- **Status:** Accepted · **Date:** 2026-11-20 · **Version:** 2.2.0

## Context

The site's colours, fonts and text sizes are Sass values compiled into the stylesheets, so changing the look needs a
developer and a deploy. The owner wants to change it from the admin as a theme, with drafts, preview and approval, without
being able to publish an unreadable site (0014 V19, [0021 inception](../../aidlc/0021-editable-theme/01-inception.md)).
The site deploys only when code is merged, so a published theme can't be compiled in.

## Decision

- **CSS custom properties carry the theme.** Each colour token becomes `var(--ty-…, today's value)`; font sizes go through
  `calc(… * var(--ty-text-scale, 1))`; fonts and the heading weight are variables too. With nothing set, the site is
  exactly today's.
- **The theme is content:** `site/theme`, a flat document in the preloaded `site` collection, edited on a schema-driven
  **Theme** page (ADR-0014) with drafts, preview, approval and history (ADR-0013, ADR-0018). The rules check its shape:
  colours as `#rrggbb`, everything else from fixed lists.
- **Six colours, the rest worked out** in a pure `Theme` model. A worked-out token is set only when a colour it comes from
  differs from today's, so the default stays hand-picked.
- **Readability is enforced in the app, twice:** a `ContrastRule` blocks publishing and sending for approval when a pair is
  below WCAG 2.2 AA; and the site ignores a stored theme that fails the same check, so a write that bypasses the admin can't
  make the site unreadable. Rules can't compute contrast. The owner's preview is the one exception: it shows a
  draft theme as it is, so they can see what the check found.
- **Only `RootStyleService` (`core/services`) touches the page's style:** CSS variables on `<html>`, the `theme-color` meta
  and one font stylesheet. Setting properties through the CSSOM isn't blocked by the strict CSP (`security.autoCsp`
  covers scripts only).
- **No flash of the old look:** the shell already hides `<main>` until the `site` read arrives, and the theme is in that read.
  An inline script in `index.html` (hashed by `autoCsp`) sets the device's remembered background before the app loads.
- **Fonts from a fixed list of pairs**, each with a metric-matched fallback (as 0007 did for today's fonts, against CLS); only a non-default
  pair loads anything: its Google Fonts stylesheet and a static stylesheet of its fallbacks (`public/fonts/`).

## Consequences

- Any theme can be previewed and undone like other content, and works in the admin too.
- About 500 style declarations change mechanically (colour tokens, font sizes); screenshot baselines prove the default look
  is unchanged.
- Colour arithmetic in Sass (`rgba($color, …)`, `mix()`) can't be used on tokens any more; worked-out colours live in
  `Theme`. Bootstrap's compile-time palette keeps today's values: it's used for the grid and utilities only (ADR-0004), with no
  colour classes in templates.
- A theme can't change images or the logo; a light theme relies on the screenshot per ready-made theme to catch places that
  assume a dark page.
- **The initial budget rises from 500 to 510 kB** (owner's decision, 2026-11-20). With 0.2 kB left before
  this release, the variables' defaults on `:root`, the longer `var()` and `color-mix()` values, and the small
  code that applies a theme couldn't fit. The theme model itself is a separate chunk (`SITE_THEME_LOADER`),
  loaded only when a theme is stored, so most visits never download it. About 1–2 kB more after compression.
- Rules change: `npm run test:rules` and `npm run e2e:firebase` run, and the owner deploys the rules with the release.
