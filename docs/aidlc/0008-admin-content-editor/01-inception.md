# 01 · Inception — Admin content editor

## Problem / goal

The owner can sign in (0006), but every change to the site still needs a developer: copy, offers,
photos, team, videos, contact details. The goal is an admin area where the owner runs the whole
site alone:

- edit any text;
- upload and manage images;
- switch sections and pages on and off;
- schedule festival offers;
- publish when ready, with a preview first;
- follow up on proposal requests.

The starting point is the prototype's editor (`design/prototype/project/Admin.dc.html`). Its demo
logic stores nothing. The catalogue below lists every feature: **P** = in the prototype,
**New** = missing from the prototype but needed for the real site.

## Feature catalogue

### A. Editor shell (every admin page)

| #   | Feature                                                                                                         | Source | Notes                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| A1  | Top bar: logo, "Admin", **View site**, **Sign out**                                                             | P      | Sign-out exists since 0006                                                             |
| A2  | Tabs: Offer & theme · Page content · Gallery · Team · Shows · Achievements · Contact & links                    | P      | Extended by the new tabs below                                                         |
| A3  | Two-column layout: a live preview of the section being edited (left), settings and tips (right)                 | P      | Preview uses the real site components, so "what you see is what the website will show" |
| A4  | Click-to-edit text in the preview; headings keep the site's type while typing                                   | P      | Every editable field also has an accessible form label (WCAG 2.2 AA)                   |
| A5  | Save state: "All changes saved" / "Unsaved changes"                                                             | P      | Real autosave to a **draft** (see F1)                                                  |
| A6  | **Preview site** and **Publish changes** buttons                                                                | P      | Real draft and publish (F1–F3)                                                         |
| A7  | Contextual writing tips per tab                                                                                 | P      | Kept from the prototype                                                                |
| A8  | **Dashboard** as the admin home: new proposals, offer status, last published, hidden sections, content warnings | New    | Replaces the 0006 placeholder home                                                     |
| A9  | **Unsaved-changes guard** when leaving a tab or closing the browser                                             | New    |                                                                                        |
| A10 | **Responsive admin** (phone and tablet)                                                                         | New    | The owner will often edit from a phone                                                 |
| A11 | **Toasts** for saved, published, upload done and errors                                                         | New    | Reuses the site's toast service                                                        |

### B. Section and page visibility (requested)

| #   | Feature                                                                                                                                                                                                                                                               | Source | Notes                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **On/off switch for every home section:** marquee, trust strip, offer, who it's for, experiences, shows, drum circle details, rhythm game, videos, gallery, philosophy, mid-page call to action, cities, how it works, team, Instagram, testimonials and clients, FAQ | New    | Only "Offer is live" exists in the prototype. The hero and contact form stay on, because every "Request proposal" button leads to them |
| B2  | **On/off switch for inner pages:** Videos, Team, Shows, Achievements                                                                                                                                                                                                  | New    | When off, menu and "See all" links disappear and the route returns to the home page                                                    |
| B3  | **Site-wide widgets:** festival badge and offer card, chat assistant, mobile action bar, utility bar (phone and email), intro loader                                                                                                                                  | New    |                                                                                                                                        |
| B4  | **Item-level hide:** hide one video, team member, show format, testimonial, offer card, FAQ or milestone without deleting it                                                                                                                                          | New    | Keeps the content for later                                                                                                            |
| B5  | Hidden sections are skipped completely: no data read, no menu link, and a `#gallery`-style link falls back to the top of the page                                                                                                                                     | New    | Keeps performance and anchor links correct                                                                                             |
| B6  | **Section order** on the home page (drag to reorder)                                                                                                                                                                                                                  | New    | Nice to have; can come later                                                                                                           |

### C. Offer and festival theme

| #   | Feature                                                                                                                                          | Source | Notes                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | "Offer is live" switch: shows the badge and the offer band                                                                                       | P      |                                                                                                                                                |
| C2  | **Festival theme picker:** Diwali, Holi, Navratri, Ganesh Chaturthi, Dussehra, Baisakhi, Gurpurab, Christmas, Halloween, New Year, "No festival" | P      | Each theme sets the offer colours and an animation. The site has only the Diwali "sparks" today, so the other 10 animations are new build work |
| C3  | **Schedule:** "Live from" and "Ends on" dates; the offer hides itself outside them                                                               | P      | Checked in the browser at load time, so no redeploy is needed                                                                                  |
| C4  | Badge text, eyebrow, title, lead, button label                                                                                                   | P      |                                                                                                                                                |
| C5  | Offer cards: title, description, duration and price note                                                                                         | P      | Add, remove, reorder and hide are new                                                                                                          |
| C6  | **Live preview of the theme's colours and animation**                                                                                            | P      | Respects reduced motion                                                                                                                        |
| C7  | **Theme preview against both light sections and the dark hero**                                                                                  | New    | Checks colour contrast before publishing                                                                                                       |

### D. Page content (home)

| #   | Feature                                                                                   | Source | Notes                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Hero: eyebrow, two-line headline, lead, button labels, audience pills                     | P      |                                                                                                                                                                                                                                                                                                                                                                                   |
| D2  | Section headings: who it's for, experiences, rhythm game, videos, team, plan your session | P      |                                                                                                                                                                                                                                                                                                                                                                                   |
| D3  | Site details: browser tab title, tagline under the logo                                   | P      |                                                                                                                                                                                                                                                                                                                                                                                   |
| D4  | **Every other home section's copy and lists**                                             | New    | Experiences (featured item and items, with categories and images), who it's for (cards), drum circle details (specs, objectives, occasions, flow, related, 3 photos), philosophy (pillars, goals, journey), cities, how it works (steps), FAQ (questions), testimonials (quotes, stats, client names), marquee words, trust strip items, Instagram posts, mid-page call to action |
| D5  | **Contact form options:** event types, group sizes, experience choices, messages          | New    | Today these are in data, but only a developer can change them                                                                                                                                                                                                                                                                                                                     |
| D6  | **Chat assistant:** greeting, quick replies and answers                                   | New    |                                                                                                                                                                                                                                                                                                                                                                                   |
| D7  | Rhythm game text (modes, messages, ranks)                                                 | New    | Low priority                                                                                                                                                                                                                                                                                                                                                                      |
| D8  | **Character counters** that follow the writing tips (e.g. headline ≤ 40 characters)       | New    | Warn, never block                                                                                                                                                                                                                                                                                                                                                                 |

### E. Collections

| #   | Feature                                                                                                                                    | Source | Notes                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | **Gallery:** add, remove and reorder photos; edit alt text; section heading                                                                | P      | "Upload photos" is real (G1)                                                                                                                                           |
| E2  | **Team:** name, role, bio, fun fact, photo upload or avatar, add and remove members; "the first four appear on the home page"              | P      | **Skills** (stored in data, missing from the prototype), reorder and hide are new                                                                                      |
| E3  | **Show formats:** name, description, ensemble, set length, best for, add and remove                                                        | P      | **Image**, **icon**, **featured** (the classical spotlight) with its spotlight copy, and reorder are new                                                               |
| E4  | **Achievements:** headline numbers, milestones (reorder), awards                                                                           | P      | **Press** and **performances** (stored in data, missing from the prototype) are new                                                                                    |
| E5  | **Videos editor:** paste a YouTube link; title, category, caption, duration, thumbnail (from YouTube or uploaded); featured; reorder; hide | New    | No video tab in the prototype. Video files themselves stay on YouTube: hosting them would hurt speed and cost                                                          |
| E6  | **Inner page copy:** hero text for Videos, Team, Shows and Achievements; team values; show setups and process; call-to-action blocks       | New    |                                                                                                                                                                        |
| E7  | **Contact & links:** phone, WhatsApp number, email, name, address, hours, Maps link, Instagram, YouTube and Facebook                       | P      | Plus local name, locality, plus code, directions link and copyright year, which exist in data. Note: "Visit us" sits in the utility bar, planner, footer and assistant |
| E8  | **Validation:** phone and WhatsApp in international format, valid email and URLs, required fields                                          | New    | The same rules apply in `firestore.rules`                                                                                                                              |

### F. Draft, preview and publish

| #   | Feature                                                                                                                                                 | Source     | Notes                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------- |
| F1  | **Drafts:** every edit autosaves to a draft, so visitors never see half-finished work                                                                   | New        | The prototype's save button only flipped a flag     |
| F2  | **Preview site** opens the real site with the draft content and a "Preview" banner                                                                      | P (button) | Only the signed-in admin can read drafts            |
| F3  | **Publish** copies the draft to the live site, after a confirmation that lists what changed                                                             | P (button) | Visitors see it on their next page load             |
| F4  | **Discard draft** returns to the live content                                                                                                           | New        |                                                     |
| F5  | **Publish history** of the last 20 publishes, with **restore**                                                                                          | New        | Protects against mistakes                           |
| F6  | **Pre-publish checks:** warn about leftover placeholders (`[NAME]`, `[Add duration & price]`), missing alt text, empty required fields and broken links | New        | Most of today's placeholders are in square brackets |

### G. Media: images and files (requested)

| #   | Feature                                                                                                           | Source                       | Notes                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| G1  | **Upload images:** drag and drop or choose files, several at once, with progress and retry                        | P (button)                   | JPEG, PNG, WebP and HEIC (iPhone)                            |
| G2  | **Automatic optimisation:** resized to at most 2400 px, served as WebP or AVIF at the size each screen needs      | P ("over 3000px is resized") | Through the image service's URL transforms (`f_auto,q_auto`) |
| G3  | **Alt text is required** before an image is used                                                                  | P (hint)                     | Enforced: an image with no description can't be published    |
| G4  | **Crop and focal point** per use: square for team, 4:3 for the gallery, 16:10 for shows and experiences           | New                          | So faces aren't cut off                                      |
| G5  | **Media library:** all uploads in one place; reuse an image anywhere; search; shows where each image is used      | New                          |                                                              |
| G6  | **Replace an image** in place, keeping every place that uses it                                                   | New                          |                                                              |
| G7  | **Delete with a usage check:** "used in 2 places" blocks deletion                                                 | New                          |                                                              |
| G8  | **Privacy:** GPS and camera data (EXIF) are stripped on upload                                                    | New                          | Phone photos carry the location by default                   |
| G9  | **Limits:** 15 MB per file, image types only, checked in the browser and again on the server                      | New                          |                                                              |
| G10 | **Brand images:** logo, social share image (1200×630), avatar set for team members without photos                 | New                          | The prototype's avatar picker becomes a managed set          |
| G11 | **Documents (PDF):** a brochure or rate card that visitors can download from the offer, shows or contact sections | New                          | Optional; confirm whether it's wanted                        |

### H. Proposal requests (inbox)

| #   | Feature                                                                                                          | Source | Notes                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| H1  | **Inbox** of the proposals submitted through the contact form, newest first, with a "new" count on the dashboard | New    | They're stored in Firestore today, but only visible in the Firebase console |
| H2  | **Detail view:** every field, plus one-tap **call**, **WhatsApp** and **email** replies                          | New    |                                                                             |
| H3  | **Status:** New → Contacted → Quoted → Won / Lost, with private notes                                            | New    |                                                                             |
| H4  | Filters by status and date; **CSV export**                                                                       | New    |                                                                             |
| H5  | **Delete** a request (privacy); optional automatic removal after 24 months                                       | New    | Personal data shouldn't be kept forever                                     |

### I. SEO and site settings

| #   | Feature                                                                   | Source | Notes                                                                                                                      |
| --- | ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| I1  | Browser tab title and tagline                                             | P      |                                                                                                                            |
| I2  | **Search description per page** (home, Videos, Team, Shows, Achievements) | New    | Moves the 0007 descriptions from code into data                                                                            |
| I3  | **Social share image** upload                                             | New    | The tags in `index.html` are fixed at build time, so a new image goes live with the next deploy. Recorded as a known limit |

### J. Account and security

| #   | Feature                                                                                     | Source | Notes                                       |
| --- | ------------------------------------------------------------------------------------------- | ------ | ------------------------------------------- |
| J1  | **Change password** (asks for the current one again)                                        | New    | Reset by email exists since 0006            |
| J2  | **Admin-only writes in `firestore.rules`**, by the admin UID, with field validation; tested | New    | Planned in 0006 for this feature            |
| J3  | **App Check** on Firestore and the upload function                                          | New    | ADR-0010 deferred it "until editing exists" |
| J4  | **Proposals readable and updatable by the admin only**; still create-only for visitors      | New    |                                             |
| J5  | **Activity log:** what was published or deleted, and when                                   | New    |                                             |
| J6  | **Content backup:** export all content as JSON; import into a draft                         | New    | Also a safety net besides F5                |

## User stories

- As the **owner**, I want to edit any text on the site and see it as visitors will, so that I
  don't need a developer for wording changes.
- As the **owner**, I want to turn sections, pages and widgets on and off, so that the site shows
  only what's ready or relevant this season.
- As the **owner**, I want to upload photos from my phone, add a description, and crop them for
  each place they appear, so that the site always shows our latest events.
- As the **owner**, I want to schedule a festival offer with its theme, so that it appears and
  disappears on the right dates without me remembering.
- As the **owner**, I want to save drafts, preview them and publish when ready, and undo a
  publish, so that visitors never see mistakes or half-done work.
- As the **owner**, I want to see and track proposal requests in one place, so that no enquiry
  is missed.
- As a **visitor**, I want the site to stay as fast as it is today, so that admin features
  never slow down the public pages.
- As a **keyboard or screen-reader user** (owner), I want every editor control to be operable
  and labelled (WCAG 2.2 AA).

## Acceptance criteria (whole programme)

- [ ] Given a signed-in owner, when any field in sections C–E is changed, then a draft is
      saved automatically and visitors still see the published version.
- [ ] Given a draft, when "Preview site" is opened, then the real site shows the draft with a
      preview banner, and only the admin can open it.
- [ ] Given a draft with leftover placeholders or missing alt text, when "Publish" is pressed,
      then the problems are listed before confirming.
- [ ] Given a publish, when a visitor next loads the site, then they see the new content, and
      the owner can restore the previous version from the history.
- [ ] Given a home section switched off, when the site loads, then the section, its menu links
      and its data read are gone, and links to its anchor land at the top of the page.
- [ ] Given an inner page switched off, when its URL is opened, then the visitor lands on the
      home page and no menu or "See all" link points to it.
- [ ] Given an uploaded phone photo, when it is saved, then its location data is removed, it is
      served as WebP or AVIF at the right size, and it can't be published without alt text.
- [ ] Given an offer scheduled from 1 to 10 November, when a visitor opens the site on 11
      November, then the badge and offer band are hidden.
- [ ] Given any account other than the admin UID, when it writes to content, media or
      proposals, then `firestore.rules` and the upload function refuse it (tested).
- [ ] Given a new proposal, when the owner opens the dashboard, then it shows as new, and its
      status and notes can be changed.
- [ ] Given the public pages, when measured, then no admin code is downloaded and Lighthouse
      scores don't drop.
- [ ] `npm run verify`, `npm run e2e`, `npm run test:rules` and `npm run e2e:firebase` pass.

## Units of work (proposed releases)

The programme is too large for one release, so it's split into four. Each one gets its own
design and approval and is useful on its own.

| Release   | Feature                      | Contents                                                                                                                                                                                                                                                                                        |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.6.0** | 0008 · Editor foundation     | Write rules and App Check (J2, J3); drafts, preview, publish, history (F1–F6); editor shell and dashboard (A1–A11); section, page and widget visibility (B1–B5); offer, schedule and Diwali theme (C1, C3–C7); site details, contact and links (D3, E7, E8); hero and section headings (D1, D2) |
| **1.7.0** | 0009 · Media                 | Upload pipeline and media library (G1–G10); gallery (E1); team with photos (E2); show formats with images (E3); videos (E5)                                                                                                                                                                     |
| **1.8.0** | 0010 · All remaining content | Every other home section (D4–D7), inner page copy (E6), achievements in full (E4), SEO settings (I1–I3), item-level hide (B4), remaining 10 festival themes (C2), counters (D8)                                                                                                                 |
| **1.9.0** | 0011 · Proposals and account | Inbox (H1–H5), proposal rules (J4), change password (J1), activity log (J5), backup (J6), section order (B6)                                                                                                                                                                                    |

## Risks & open questions

**Decisions for the owner:**

1. **Where uploaded images are stored.** CLAUDE.md names **Cloudinary**, with signed uploads
   through a small server function, so the API secret never reaches the browser. That needs a
   Cloudinary account (the free tier is enough to start) and an **Azure Functions API** on the
   Static Web App, which verifies the admin's Firebase sign-in before signing an upload. The
   alternative, Firebase Storage, now needs the paid Blaze plan. **Recommendation: Cloudinary.**
2. **Release order.** If proposal follow-up matters more than editing, the inbox (1.9.0) can
   move first: it's independent of the rest.
3. **Documents (G11):** is a downloadable brochure or rate card wanted?
4. **Which sections must never be switched off?** Proposed: the hero and the contact form.

**Technical risks:**

- **Fresh content vs. caching:** visitors read each collection once per visit. A publish shows
  on the next page load, not on pages already open. Acceptable; noted in the admin.
- **Sitemap and share tags are built at deploy time.** A page switched off stays in
  `sitemap.xml` until the next deploy. The page itself redirects, so search engines drop it.
- **Data size:** drafts and history double the stored content. That's far below the free quota,
  and public pages never read drafts.
- **Rules complexity:** validating every field in `firestore.rules` is large. Each release adds
  rules only for what it edits, with tests.
- **Admin bundle:** editors, cropper and uploader load only in the admin chunk. Verified per
  release.
- **The 10 extra festival animations** (C2) are design work as well as code. Each must respect
  reduced motion and must not hurt CLS.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-30. Open decisions taken as recommended: Cloudinary for uploads (1.7.0), releases in the proposed order, the hero and contact form always on. PDFs (G11) are decided in the 1.7.0 design.
