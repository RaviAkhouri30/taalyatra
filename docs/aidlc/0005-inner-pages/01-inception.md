# 01 · Inception — Inner pages

## Problem / goal

The header, footer and home page already link to **Videos**, **Team**, **Shows** and
**Achievements**, but those routes redirect to the home page. Build the four pages from the design
prototype (`design/prototype/project/{Videos,Team,Shows,Achievements}.dc.html`), pixel-perfect at
every breakpoint. They use the MVVM and ports/adapters foundation, with every piece of copy coming
from Firestore like the home page (0003, 0004).

Content launches with the design's placeholders (`[NAME]`, `[YEAR]`, `[Award name]`…). They're
stored in Firestore, so the owner can replace them without a release. The **Admin** page is out of
scope and becomes its own feature (sign-in, content editing, write rules, App Check).

## User stories

- As a **visitor**, I want to browse every video by category (Corporate, Family, Workshops, Behind
  the scenes) and open one on YouTube, so that I can see what a session feels like.
- As a **visitor**, I want to meet the whole team, with their roles, skills and a fun fact, so that I
  know who will run my event.
- As a **visitor planning an event**, I want to see the show formats (ensemble size, set length,
  best for), the setups they play in and how a show comes together, so that I can pick the right
  one.
- As a **visitor**, I want to see milestones, awards, press and notable performances, so that I can
  trust the group with my event.
- As a **visitor on any page**, I want a clear path to request a proposal or WhatsApp the team.
- As a **keyboard or screen-reader user**, I want every page, filter and link to be operable and
  announced correctly (WCAG 2.2 AA).
- As the **business**, I want all page copy in Firestore, so that I can replace the placeholders
  without a code release.

## Acceptance criteria

- [ ] Given `/videos`, `/team`, `/shows` and `/achievements`, when opened directly or from any
      link, then the page renders with inner-page chrome (header, footer, card promo, WhatsApp
      button), its own document title, and no redirect to home.
- [ ] Given the Videos page, when a category chip is chosen, then only that category's videos show,
      the count updates and is announced, the first match is featured, and "All" restores the full
      list.
- [ ] Given the Videos page, when a video is opened, then it opens on YouTube with an accessible
      name ("Watch {title} on YouTube").
- [ ] Given the Team page, when it loads, then every member in `team` shows a photo, role, name,
      bio, skills and fun fact, followed by the three values and a CTA.
- [ ] Given the Shows page, when it loads, then it shows the formats (with ensemble, set length and
      best-for), the setups, the four steps and the CTAs (proposal, WhatsApp, videos).
- [ ] Given the Achievements page, when it loads, then it shows the stats, milestones timeline,
      recognition, press, notable performances and a CTA.
- [ ] Given each page's copy, when served, then it comes from Firestore (`pages/{videos, team,
  shows, achievements}` plus the existing `videos` and `team` collections), with the same
      content in `fake-db.json` for development and tests.
- [ ] Given any viewport from 375 to 2300 px wide, when computed styles are compared with the
      prototype, then they match except for documented deviations.
- [ ] Given each page, when scanned, then axe reports no WCAG 2.2 AA violations, CLS stays below
      0.1, and Playwright screenshots pass on desktop, tablet and mobile.
- [ ] `npm run verify` and `npm run e2e` pass, coverage stays ≥ 90 %, and the Lighthouse targets
      hold.

## Units of work

1. **Routing:** lazy routes for the four pages with `PageLayout.Page` and titles; the
   `**` fallback stays.
2. **Data:** `pages/*` documents in `fake-db.json`, seeded to Firestore. `firestore.rules` gets
   read-only `pages/*`, with rules tests. Endpoints go in `ApiEndpoint`.
3. **Videos page:** hero with category chips and count, featured video, grid, CTAs. Reuses
   `VideosService`, `filter-chips` and `video-card`.
4. **Team page:** hero, member grid, values, CTA. Reuses `TeamService`.
5. **Shows page:** hero, formats, setups, steps, CTA. Reuses `steps`.
6. **Achievements page:** hero, stats, milestones timeline, recognition, press and notable
   performances, CTA.
7. **Shared pieces:** a page CTA band and anything else two or more pages need, extracted into
   `shared/components` rather than duplicated.
8. **E2E:** a spec per page (render, filter, links), axe scans, visual baselines on 3 viewports,
   and a Firebase smoke check for one page.
9. **Docs:** component tree, data model, sequence diagram (Videos filter), ADR if needed;
   CHANGELOG and version **1.3.0** (after 1.2.0).

## Risks & open questions

- **Stacked branch.** `feat/inner-pages` builds on `feat/firebase-data` (PR not merged). If that PR
  changes, this branch is rebased onto it. 1.3.0 ships after 1.2.0.
- **Per-page reads and CLS.** Each inner page reads its `pages/*` document plus, for Videos and
  Team, a list collection. The shell's settle gate (0004 addendum A) already hides `<main>` until
  the chrome is ready. The page sections must also render in one pass, which design will settle:
  one document per page, read once.
- **Placeholder content is visible to visitors.** Bracketed placeholders (`[NAME]`, `[YEAR]`) go
  live on public pages until the owner replaces them, the same as the home page today.
- **Design overlap with the home page.** The home teasers (shows formats, videos, team) and the
  full pages share data. Design decides what is shared and what is page-specific, so content isn't
  stored twice.
- **The prototype's Videos thumbnails are blob placeholders.** The pages use the same local images
  the home page uses (`fake-db.json` → `videos[].image`).
- **E2E and visual baselines** add about 4 pages × 3 viewports of screenshots. Run time goes up.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28 (condition: no duplicated data; shared data is fetched once into a common service and reused)

---

## Addendum A: copyable address, toasts, Shows spotlight (2026-10-28)

Raised by the owner after reviewing Construction.

**Stories**

- As a **visitor**, I want the long address shortened, with the full text on hover or focus,
  and copied when I click it, so that the footer stays compact and I can paste the address
  into a maps app.
- As a **visitor**, I want a short confirmation message (toast) when something happens, such as
  "Address copied".
- As the **business**, I want shows, and especially classical tabla concerts, to look as
  important as the workshops, with images.
- As the **business**, I want the "Visit us" phone row to say "Call us" instead of showing the
  number.

**Acceptance criteria**

- [ ] Given the footer's "Visit us" details, when they render, then the address is cut to one
      line with an ellipsis. Hovering or focusing it shows the full address in a tooltip, and
      Escape closes the tooltip.
- [ ] Given the address, when it is clicked or activated with the keyboard, then the full
      address is copied and a toast says so. If copying fails, the toast says so and suggests
      selecting the text.
- [ ] Given any toast, when it appears, then screen readers announce it politely and it closes
      by itself after a few seconds.
- [ ] Given the home page's Shows section, when it renders, then a classical tabla concert
      spotlight (large image, story, two buttons) leads it, followed by the other formats as
      cards with images.
- [ ] Given the Shows page, when it renders, then the same spotlight leads the formats, and every
      format card has an image.
- [ ] Given the classical concert's content, when stored, then it is one `showFormats` record
      (the single source, ADR-0011), and the images are paths stored in Firestore so real photos
      can replace the illustrations without a release.
- [ ] Given the "Visit us" phone row, when it renders, then it reads "Call us" and links to
      the number, with the number in its accessible name.

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28 (in chat: spotlight + photo cards,
tabla / Hindustani, illustrated placeholders, "Call us")
