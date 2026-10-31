# ADR-0015: Owner switches for sections, pages and widgets

- **Status:** Accepted · **Date:** 2026-10-31 · **Version:** 1.6.0

## Context

The owner wants to show only what is ready or relevant: hide a home section, an inner page or a
site-wide widget without deleting its content.

## Decision

- **Storage:** `site/visibility` holds `{ sections, pages, widgets }`, maps of key → boolean, with
  keys from the `HomeSection`, `SitePage` and `SiteWidget` enums. It sits in the preloaded `site`
  collection, so reading it costs no extra round trip. (The design called it `site/layout`; it
  was renamed so it doesn't clash with `PageLayout`.)
- **Safe default:** only an explicit `false` hides something. A missing document, key or
  malformed value shows everything, so a bad write can't blank the site. `SiteVisibilityService`
  always emits, so guards that wait on it never hang.
- **Effect on the site:**
  - the home page renders switched-off sections not at all, so they read no data;
  - menu, footer and home-page links to hidden targets are dropped (`applyVisibility`,
    `visibleLink`);
  - `pageEnabledGuard` (`canMatch`) sends a switched-off inner page to the home page without
    downloading its chunk;
  - the shell drops switched-off widgets.
- The hero and the contact form have no switch: every "Request proposal" button leads to them.
  The offer follows its own switch and dates (`PromotionSchedule`, in Pune time).

## Consequences

- `sitemap.xml` is built at deploy time, so a switched-off page stays listed until the next
  deploy. The page itself redirects, so search engines drop it.
- Links between inner pages (team → videos, achievements → shows, shows → videos) aren't
  filtered until those pages become editable (1.8.0); the guard sends them home meanwhile.
