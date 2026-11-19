# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org).
See [docs/versioning.md](docs/versioning.md).

## [Unreleased]

## [2.0.1] - 2026-11-19

### Added

- **Photo uploads for managers:** a manager whose **Can upload photos** is on adds photos to the library, from the library
  or while choosing a photo for a page, and can describe them. With it off, they see why instead of the upload area, and
  the upload service refuses them too.

### Changed

- **Replacing and deleting photos are yours only:** a manager doesn’t see Replace or Delete, since either changes the live
  site.

## [2.0.0] - 2026-11-19

A second kind of account: content managers, who help with the website on the pages you allow, with your approval where
you want it. You stay the owner, with full access that nothing on the new pages can take away.

### Added

- **Team access** in the editor’s menu (Settings): add a manager by the User UID of the account you created for them in
  Firebase, and their email. For each editor page choose **Hidden**, **Needs approval** (the default) or **Can publish**,
  and whether they can upload photos. Change or remove a manager at any time; it applies from their next click.
- **Send for approval:** on Review & publish, a manager’s changes on pages that need approval are sent to you with a note,
  and those they may publish go live, from one button that says which is which.
- **Waiting for your approval** on Review & publish, with a count in the menu and on the dashboard: check each change in
  the preview, then **Approve and publish**, or **Send back** with a reason the manager sees.
- **Who changed what:** Review & publish names the author of each change and has a tick box on each. Your own changes are
  ticked; someone else’s start unticked, so nothing half-finished goes live by accident. The history says who published,
  and whose change was approved.
- **A waiting page is locked for managers** until you answer, so you approve exactly what you reviewed; the manager can
  withdraw it to keep editing. You can still adjust it before approving.
- **The manager’s own dashboard and menu:** only their pages and requests. Leads, Visits, backups, going back to an
  earlier publish, the speed report and Team access stay yours.

### Changed

- **The publish bar publishes your own changes only.** A colleague’s are published from Review & publish.
- **New database rules** decide who may change what, page by page. Deploy them with this version
  (`npm run deploy:rules`); your own access is unchanged.

### Coming in 2.0.x

- Managers can’t upload photos yet, whatever their setting; deleting and replacing photos will stay yours.

## [1.13.0] - 2026-11-18

### Added

- **Visits** in the editor’s menu: graphs of visits and proposals by day, week, month or year, which pages visitors arrive
  on, and phone or computer. Visits are counted anonymously from this version on: no cookies and nothing that identifies
  anyone. Search robots, browsers that ask not to be tracked, and your own visits from a browser where you’ve opened the
  editor aren’t counted.
- **Leads** in the editor’s menu: every proposal from the website, newest first, with buttons to call, WhatsApp or email.
  Mark each one New, Contacted, Won or Lost, filter and search them, export what you see as a spreadsheet (CSV), or remove
  one for good when a customer asks. The menu and the dashboard show how many are new.
- **Include leads** in a backup when you tick the box. That file holds customers’ details, so it’s only downloaded, never
  kept in the browser.

## [1.12.0] - 2026-11-18

Released together with 1.13.0: the two went live in the same update.

### Added

- **What’s new** in the editor’s menu: every update’s notes, newest first, with a **New** marker until you’ve read them.
  The dashboard shows the latest update in brief.
- **Backups:** download one file with the website’s words, settings and photo descriptions, from Review & publish or right
  after publishing. A copy is also kept in this browser. The dashboard reminds you when the last one is over 14 days old.
- **Restore a backup** from a file or this browser’s copy. It goes into your draft first, so you can check every change in
  Review & publish before anything goes live. A file that isn’t a backup is refused, and nothing changes.
- **Changes are never lost:** each change is kept on this device the moment you make it. If it couldn’t be saved (offline,
  or the tab closed too soon), the page offers it back next time: **Restore them** or **Throw them away**.

### Changed

- **Go back to before any publish** (was “Undo this publish”): going back past later publishes undoes them too, after a
  warning that offers a backup first.

## [1.11.0] - 2026-11-18

### Added

- **Click a section in the preview to edit it.** Hovering a section outlines it and says which tab edits it; clicking opens
  that card, on the current tab or another.

### Changed

- **The admin menu now follows the website**: Hero, Offer, Who it's for, Experiences, Shows, Drum circle, Rhythm game,
  Videos, Gallery, Team and Proposal form, in page order, then Settings. Each section's heading, text and pictures are on
  one page. Old "Page content" links open Hero.
- **Find** at the top of the menu: type "phone", "about" or "Diwali" to go straight to the field.
- **The dashboard's to-do list** says what's still sample text in plain words, grouped by section, each with a Fix link.
- **Plain words** throughout ("Undo changes", "Show or hide sections", "Photo library"), quieter forms (character counts
  only near the limit), and on phones a one-row top bar with the preview switch in the bottom bar.
- **The drum circle has its own entry in the side panel**, so its About text and picture are one click away, and
  "Music & creativity" is now called "Experiences", as on the website.

## [1.10.0] - 2026-11-18

### Added

- **Reorder lists easily:** shows, experiences, team, videos and gallery photos have an Order panel: drag a name, or use the
  arrows. The featured show or experience is pinned first. Long items fold to one line.
- **Fold less important home sections** behind Show more: Our philosophy and Good to know everywhere, and Where we play, How it
  works, Proof in the room and From our circles on phones. Each is changeable in Sections & pages; Find on page still opens
  them.

### Changed

- The drum circle section shows one picture beside the About text, with smaller tags and the proposal button; on phones its
  session flow folds. The editor edits one picture.
- WhatsApp and Call buttons are green and terracotta with dark icons, and animate a few times like the chat icon, then rest.
  The chat icon now rests too. Nothing moves for visitors who ask for less motion.
- The editor's preview stays hidden until the section being edited has loaded, instead of showing a blank page.

## [1.9.0] - 2026-11-17

### Added

- **Drum circle details are editable** (Music & creativity tab): headings, the four facts, About, objectives, occasions,
  the three pictures (upload, crop, description), similar experiences and the session flow.
- Home page sections fade in and rise gently the first time they scroll into view. Nothing moves for visitors who ask for
  less motion.
- The editor's preview follows the section you scroll to, fades instead of racing across the page, and comes back to the
  same section after each save.

### Fixed

- Speed reports leave out automated visitors (Lighthouse, PageSpeed, search crawlers, scripted browsers), so the dashboard
  shows real people's visits.
- Links to a home section, such as **Request proposal**, now land on it. Before, they could stop thousands of pixels short
  while the page was still filling in, after a fast blur of scrolling.
- Proposal requests now reach `contact@taalyatra.in` by email. Before, they were only stored. Each form field arrives as its own line.

### Changed

- The proposal form now asks for an email address, so every request can be answered (and sent an automatic reply).
  WhatsApp still works without one.

## [1.8.0] - 2026-11-05

### Added

- **Real-phone speed reports (0012).** Visits send one anonymous report of how fast the page was, with no IP address, ID or cookie.
  Nothing is sent from the admin area or previews, or when the browser asks not to be tracked. A dashboard card shows the results
  and says whether phones meet the 2.5 s target.

### Changed

- Review & publish keeps working if the media library can't be read.

## [1.7.1] - 2026-11-05

### Changed

- The admin area's top bar is slimmer, with outlined buttons. **Preview** shows or hides the preview column, and
  **View site** opens in a new tab.

## [1.7.0] - 2026-11-05

### Added

- **Photo uploads (0009).** The owner can upload photos from a phone or computer, by drag and drop or the file
  picker, three at a time with progress and retry. Location data is removed, and large photos are shrunk.
- **Media library tab.** Every uploaded photo with its description and where it's used. Photos can be replaced,
  which puts the new one everywhere as a draft, and deleted, which is refused while a photo is in use.
- **Image field with crop.** Choose or upload a photo in any image field, describe it, and crop it for that place
  only. The frame moves by drag, buttons or arrow keys.
- **Gallery, Team, Shows and Videos tabs.** Every field, with add, remove and reorder. Publish checks require a
  description on each photo, allow one featured show, and catch a photo deleted from the library. Videos can take
  their thumbnail from a YouTube link.
- **Music & creativity tab.** Every field of each experience, images with crop, add, remove and reorder, and a Featured
  switch. One is always featured, because the home page's layout needs that card.
- **A one-screen editor.** Grouped links with icons in a left panel, collapsible to icons on desktop and a slide-in
  menu on phones and tablets. The fields and a live preview, with desktop and phone views, sit beside it.
- **Publish from any page.** A bar under each editor page shows what's unpublished, with Publish and Discard. The
  Review & publish page stays for looking through changes and for undo.
- **Clearer checks.** Required fields say so, placeholders are flagged at the field, and the review page explains
  each finding and links to its card.
- **Upload function (`api/`).** An Azure Function that signs uploads and deletes for the admin only, so the
  Cloudinary secret never reaches the browser (ADR-0017).

### Changed

- Images load through our own loader: local images are unchanged, and uploaded ones come from Cloudinary.
- The dashboard's placeholder list now covers team, shows and videos.
- The editor's preview no longer shows the floating buttons and offer badge. The full preview still does.
- "Where we play" and the gallery have the usual space above them.

### Fixed

- A change made while an earlier save was running could be marked "Saved" and lost on leaving the page. "Saving…"
  now shows as soon as something changes, and "Saved" only when nothing newer is waiting.

## [1.6.0] - 2026-10-31

### Added

- Content editor at `/admin`: a dashboard, then tabs for the offer and its dates, page content
  (site details, hero, section headings), sections and pages, and contact and links. Changes
  autosave as drafts beside a live preview of the real site.
- Review and publish: required fields, formats, offer dates and leftover placeholders are checked
  first. Publishing is all or nothing, and each of the last 20 publishes can be undone.
- Switches for 17 home sections, 4 inner pages and 5 site-wide widgets. A hidden section loads
  nothing and loses its menu links; a switched-off page redirects home.
- The offer can be scheduled with start and end dates (Pune time), and hides itself outside them.
- `?preview` shows the site with unpublished changes to the signed-in owner only.
- `npm run export:firestore` backs up the live content.

### Changed

- `seed:firestore` creates only missing documents unless `--overwrite` is given, so the owner's
  edits are never replaced by accident.
- Only the admin account may write content (`firestore.rules`, tested).

### Known issues

- Links between inner pages (for example Team to Videos) stay visible when their target page is
  switched off; following one redirects home. They'll be hidden when the inner pages become
  editable (1.8.0).
- Lighthouse mobile Performance on the live home page is below the target of 95, and LCP is above
  2.5 s. See `docs/aidlc/0008-admin-content-editor/04-verification.md`.

## [1.5.0] - 2026-10-30

### Added

- SEO: a description, canonical link, Open Graph and Twitter tags for every public page,
  `LocalBusiness` structured data built from the site config, a social share image,
  `robots.txt` and `sitemap.xml`.

### Changed

- Faster first paint: the hero renders in one pass, the marquee and trust strip wait for their
  data, fallback fonts are metric-matched, photos are WebP (75–83 % smaller), and the Firestore
  chunk is preloaded. Layout shift drops to 0 on mobile and desktop.
- Accessible names of the brand link and the game pads now match their visible text.

### Known issues

- Lighthouse mobile Performance on the live home page is 89 against the target of 95, and LCP is
  3.6 s. Nothing paints until the app has started and read its data. Options are in ADR-0016.

## [1.4.1] - 2026-10-29

### Fixed

- Deep links on Azure Static Web Apps: opening or refreshing `/videos`, `/team`, `/shows`,
  `/achievements` or `/admin` returned 404. `navigationFallback` now serves `index.html`, and
  missing assets still return 404.
- Optional `site/config` fields (labels, credit, socials, promotion) missing from stored data no
  longer blank the footer. Each item falls back on its own: "Call us" shows the number, the
  address shows as text, the credit is left out.

### Known issues

- Lighthouse Performance on the live home page is 73 (mobile) and 86 (desktop), below the target
  of 95. CLS is 0.339 (mobile) and 0.158 (desktop), and mobile LCP is 3.5 s. Causes: the hero
  illustration paints before the hero text on phones, and the web fonts swap. A fix is planned for
  1.4.2.

## [1.4.0] - 2026-10-28

### Added

- Admin sign-in at `/admin` (email and password, Firebase Authentication), with password reset by
  email, sign-out and a guarded admin home. Only the admin UID is let in; other accounts are
  signed out (ADR-0012). Admin pages are `noindex`.
- `IAuthService` port with Firebase (lazy chunk, loaded only by `/admin`) and fake adapters.
- Typed Reactive Forms with validation: trimmed required fields, strict email (up to 254
  characters), password 6–128 characters; accessible inline errors.
- Shared form-field Sass mixins (`_forms.scss`).
- Auth emulator in the Firebase smoke suite; the seed creates emulator test accounts.

### Changed

- The licence is now proprietary, all rights reserved (it was GPL-3.0); `package.json`
  declares `"license": "UNLICENSED"`. The README has a full project description.

## [1.3.0] - 2026-10-28

### Added

- Inner pages: Videos (category filter, featured video), Team, Shows & performances, and
  Achievements, each reading its copy from `pages/*`.
- Shared entities stored once and read once per visit through cached services (`cacheLatest`):
  videos, team, show formats (new `showFormats` collection) and site config (ADR-0011).
- A classical tabla recital as the featured show format, with a spotlight on the home page and
  the Shows page; every format card has an illustrated image.
- A copyable footer address (ellipsis, tooltip, click to copy) and a toast system; an
  `IClipboardService` port.
- A footer credit, "Developed with love by Ravi Akhouri", linking to LinkedIn.
- `app-page-cta`, `app-show-spotlight`, `app-copy-text`, and a featured variant of
  `app-video-card`.

### Changed

- Preloaded Firestore collections (`site`, `home`, `pages`) load independently.
- The home Shows section moves onto the surface band, with a spotlight and image cards.
- The "Visit us" phone row reads "Call us".

## [1.2.0] - 2026-10-28

### Added

- Cloud Firestore backend (project `taal-yatra`) behind `IHttpBackend`: Firestore Lite in a lazy
  chunk, Firebase error codes mapped to HTTP statuses (ADR-0009).
- Site config (brand, contact, socials, promotion) stored in Firestore.
- Proposal requests stored in `proposals` as well as emailed; the visitor sees success if either
  works.
- `firestore.rules`: deny by default, read-only content, create-only proposals; emulator tests run
  in CI.
- Seed script (`npm run seed:firestore`), runtime Firebase config written by CI from GitHub
  secrets, and the Firebase smoke suite.

### Changed

- The site shell reveals `<main>` once site config has loaded, and `site`/`home` content arrives
  in one read: desktop CLS dropped from 0.12–0.16 to 0.0004 in local measurements.

### Notes

- App Check is deferred (ADR-0010).
- 1.2.0, 1.3.0 and 1.4.0 were deployed as their pull requests merged. `package.json` was bumped
  once, in 1.4.1.

## [1.1.0] - 2026-10-26

### Added

- Home page built from the design prototype, pixel-matched at 375–2300 px: intro loader, hero,
  marquee, trust row, Diwali offers, audiences, experiences with filter chips, shows, drum circle
  details, rhythm game, videos, gallery with photo viewer, philosophy, mid-page CTA, cities, how it
  works, team, Instagram, proof, FAQ, proposal form and chat assistant.
- Data layer: `IHttpBackend` port with `FakeHttpsService` (`fake-db.json`) and `RestHttpBackend`,
  chosen by a factory; `ApiBaseService` + `HttpsErrorHandler`; `ApiEndpoint` enum.
- Email: `IEmailService` port with EmailJS and fake adapters, chosen by configuration (ADR-0006).
- Proposal form: typed Reactive Form, accessible inline validation, email submit, and a WhatsApp
  link that carries the answers.
- Chat assistant with canned replies, typing indicator, quick questions and a floating
  call/WhatsApp/chat cluster.
- `AnchorScrollService` so `/#section` links work for sections that render after their data.
- Shared layer: site shell, header, footers, promo badge, mobile action bar, icons, buttons,
  lightbox, video card, filter chips and more.
- E2E journeys for every interactive section, axe scans in four page states, and 48 visual
  baselines (`npm run e2e:visual:update`).
- ADRs 0006–0008, home page AIDLC records, updated diagrams.

### Changed

- Below-the-fold home sections load `@defer (on idle)` (ADR-0007).

### Fixed

- Accessibility deviations from the design for contrast, covered targets and focus (ADR-0008).
- Favicon and touch icons.

## [1.0.0] - 2026-10-24

### Added

- Engineering rules and architecture in `CLAUDE.md`: MVVM, SOLID, standalone, signals + RxJS, no Promises.
- Documentation under `docs/`: architecture overview, class, sequence, flow and component diagrams, ADRs 0001–0005, AIDLC template.
- Runtime dependencies: Bootstrap 5.3.8, Bootstrap Icons 1.13.2, Firebase 13.1.0, EmailJS 5.0.3.
- Tooling: ESLint 10 (angular-eslint, typescript-eslint, sonarjs, security, prettier), Vitest coverage
  with 90 % thresholds, Playwright with axe on desktop/tablet/mobile, SonarQube config (scanner via pinned `npx @sonar/scan`).
- `overrides` for patched `@grpc/grpc-js` and `vite`, so `npm audit` reports 0 vulnerabilities.
- Strict TypeScript and Angular compiler options, path aliases, automatic strict CSP in production builds.
- Selective Bootstrap SCSS with design tokens, and a minimal accessible app shell.
