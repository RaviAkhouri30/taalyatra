# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org).
See [docs/versioning.md](docs/versioning.md).

## [Unreleased]

## [2.14.0] - 2026-11-23

### Added

- **Add a manager with just their email.** **Create and invite** makes their account and Firebase emails them a link
  to set their own password; you stay signed in. If the email already has an account, the form says so and asks for
  their User UID, as before.
- **Set all to** on Team access sets every page at once.

### Changed

- **The dashboard puts what needs you first** (changes to publish, approvals, a backup due, new leads), or says
  you're all caught up, then groups the rest under Your site, Visitors and News. Each card has a colour and icon for
  what it's about, and Visits shows the last 7 days as a small chart.
- **Each page's setting on Team access** is three buttons in a row (Hidden · Needs approval · Can publish), with a
  short legend instead of the long line.
- **Every dropdown in the admin** now matches the text boxes.
- **Leads:** "Show all" is now **Clear filters**, in the filters' row, shown only while a filter is set.
- **The publish bar** shows on the Dashboard and Photo library only when there's something to publish.

### Fixed

- **On a wide screen, the editor could slide up** and leave a blank space below it after AI help opened (2.13.0).
  The editor's panels now keep their own content inside them.

## [2.13.0] - 2026-11-23

### Changed

- **AI help has a new look.** Each text field has a small ✦ chip in its corner, quiet until you're in the field;
  it opens a menu of what the AI can do (or press **Ctrl J**, **⌘ J** on a Mac). While the AI writes, a ring of
  colour turns around the field; the suggestion then writes itself in word by word under it, with its length and
  your own text beside it.
- **Use this**, **Try again** and **Discard**; after Use this, **Undo** brings your text back for 8 seconds.
- For anyone whose device asks for less motion, the ring, shimmer and word-by-word are still.

## [2.12.0] - 2026-11-23

### Added

- **Chat assistant** (Settings): the chat's greeting, quick questions and answers, each answer with the words that
  bring it up, and what screen readers call its parts. The chat gives the first answer with one of its words in the
  question, so the answers can be reordered.
- **Proposal form** now edits the whole form, not only its heading: the promises under the heading, every list of
  choices and the choice each starts on, the form's labels and messages, the request as it reaches you by email and
  WhatsApp, and the "Prefer to talk?" box. Every home section now has an editor.
- Publishing is blocked while a list starts on a choice it doesn't have, which would show blank.
- On Team access, a manager's Chat assistant page starts at Needs approval.

### Changed

- The chat matches its words whatever their case, so "WhatsApp" works as typed.

## [2.11.0] - 2026-11-22

### Added

- **The inner pages' own text can now be edited in the admin.** **Videos**, **Team** and **Shows** each gain a card
  for their page: its heading, labels, buttons, Team's values, Shows' setups and steps, and the closing call to
  action. **Achievements** is a new page in the menu, with its numbers, milestones, recognition, press, performances
  and call to action.
- Each of these cards previews its own page, not the home page.
- **Search and sharing** (Settings): a title and a search description for each of the five pages, used for search
  results, the browser tab and shared links. An empty field keeps today's wording, which is shown under it.
- On Team access, a manager's Achievements and Search and sharing pages start at Needs approval.

### Changed

- While you type in a card, the preview stays on it: scrolling other cards into view no longer moves it away.

## [2.10.0] - 2026-11-22

### Added

- **Every home section can now be edited in the admin.** Six new pages: **Our philosophy** (pillars, goals and
  journey, with the call to action below it), **Where we play**, **How it works**, **Instagram** (each post's photo
  from the library), **Testimonials** (the numbers, testimonials and clients) and **FAQ**.
- **Hero** now also edits the scrolling words and the trust strip below it, and **Who it's for** its cards.
- Each new page works like the others: drafts, preview, approval, history, backups, Find and AI help. On Team access,
  a manager's new pages start at Needs approval.

## [2.9.1] - 2026-11-22

### Fixed

- The Theme page's contrast check now includes the contact section's note, so a theme can't be published with that
  note hard to read. A theme already on the site keeps showing; the check applies the next time it's changed.

## [2.9.0] - 2026-11-22

### Added

- **12 more ready-made themes** on the Theme page: Indigo night, Monsoon, Forest, Diwali, Ocean and Charcoal (dark),
  Marigold, Sandstone, Holi, Mint, Rose and Slate (light). Each passes the contrast check, and the themes are grouped
  into Dark and Light.
- **Your own themes, saved:** **Save as my theme** keeps everything on the Theme page (colours, background, text and
  fonts) under a name, listed first under **Your themes** to choose again, on every device. Rename or delete them under
  **Saved themes**. Saving changes nothing on the site: only publishing does, with approval where the page needs it.
- Backups hold the saved themes, and restoring puts them back beside any saved since.

### Changed

- The Theme page says which theme the form is now: a ready-made one, one of yours, or your own colours.

## [2.8.0] - 2026-11-22

### Added

- **The admin on your phone:** install it from the browser (Chrome → ⋮ → Install app on Android; Safari → Share →
  Add to Home Screen on iPhone) and it gets its own icon and name, “TY Admin”, opens full screen at the admin, and shows
  each new release the next time you open it. The public site isn't part of it.
- **Help → Install on your phone** shows the steps for both phones, with an **Install** button on Android when the
  browser offers one.

### Changed

- On iPhone, the admin's top bar and menu sit below the status bar when it runs full screen.

## [2.7.0] - 2026-11-22

### Added

- **A smarter chat on the site:** questions visitors type are answered by AI from the site's own information (the
  experiences, shows, FAQ, how it works and contact details, never a section you've hidden), briefly, and pointing to
  the proposal form or WhatsApp when the answer isn't there. The quick-reply buttons keep your own answers.
- The chat now says that typed questions may be answered by AI, and asks visitors not to share personal details.

### Changed

- It answers with AI only once you add `AI_CHAT` = `on` in Azure (see the deployment notes). Until then, and whenever
  the AI can't answer, the chat replies from its script exactly as before. Each visitor can ask 10 questions an hour,
  and the chat answers 500 a day.

## [2.6.0] - 2026-11-22

### Added

- **Help writing with AI:** under any text field, **AI help** rewrites your text clearer, shorter, warmer or more
  formal, or fixes its spelling and grammar; for an empty field it suggests a first version. Beside an uploaded
  photo's description, **Suggest a description**. Nothing changes until you choose **Use it**; **Keep mine** leaves
  your text as it was.
- **Analyse leads:** on Leads, **Analyse these leads** gives a short summary of what brings enquiries, what wins and
  the busy months. Only counts are sent, never a name, phone number, email or message.
- The help appears once the AI is set up in Azure (see the deployment notes); until then nothing changes. Each account
  has 50 AI requests a day.

## [2.5.0] - 2026-11-21

### Added

- **A super manager:** on Team access, make a manager a **Super manager**, for good or until the end of a day you
  choose (India time). They approve or send back other managers' changes for you, publish every page and use every
  area. It ends by itself on that day, even if you forget, and their own settings apply again.
- **You see what they did:** the publish history reads “approved by … for the owner, sent by …”, and your dashboard
  counts the changes approved for you since you last looked. A super manager's dashboard says when their access ends.
- Every answer to a request now records who gave it, and a manager's request shows who approved or sent it back.

### Changed

- Team access, your account and deleting the history stay yours alone, even for a super manager.

## [2.4.0] - 2026-11-21

### Added

- **A manager who can approve their own changes:** turn on **Can approve their own changes** for a manager on Team
  access. Their changes on pages that need approval then go live when they approve them, with an optional title and a
  note on what changed and why.
- **You see every self-approval:** the publish history shows “self-approved by …” with its title and note, and your
  dashboard counts the self-approvals since you last looked. You can still go back over any of them.
- A manager who can approve sees **Approve it yourself** on a request that’s still waiting for you.

## [2.3.0] - 2026-11-21

### Added

- **Give a manager your areas**, one switch each on Team access: **Leads**, **Visits and speed**, **Backups** and
  **Going back**. All are off until you turn them on, existing managers included, and each appears in their menu,
  dashboard, tour and Features page.
- **Leads say who changed them:** every status change shows who made it and when (“Contacted by priya@…”, or “by
  you”).

### Changed

- A manager with Backups downloads backups but can’t restore one; with Going back, they can undo only publishes of
  pages they may publish. Deleting a lead, restoring a backup and Team access stay yours.

## [2.2.0] - 2026-11-21

### Added

- **A Theme page**, in Settings: choose a ready-made theme (Warm night, today’s look; Daylight; Festival; High contrast)
  or set your own six colours, the page background, the text size, how bold headings are, and the fonts. The preview
  shows the whole site in the draft theme, and publishing changes every page, this admin included.
- **Readability is checked as you choose:** each pair of colours shows its contrast, and a theme some visitors couldn’t
  read can’t be published or sent for approval; the page names the colour to change.
- **Reset to the default theme** puts today’s look back as a draft.
- Managers get the Theme page on Team access like any other page; by default their changes wait for your approval.

### Changed

- **Form fields are easier to see:** their edges, the outline buttons’ borders and the placeholder text are slightly
  lighter, so they reach the contrast the theme now checks for.

## [2.1.1] - 2026-11-20

### Changed

- **Review & publish explains itself** in one line at the top, as every other admin page does, and asks “Publish 2
  changes?” instead of “Publish 2 changed documents?”.
- **An empty list says what to do**: “None yet. Press “+ Add …” to add one”, instead of showing only the button.
- **Every admin page starts in the same place**, so the heading no longer jumps as you move between pages; Hero, Who it’s
  for and Rhythm game no longer repeat their title.
- **On phones, the bars take less room**: the editor’s Show preview, Undo changes and Publish share one row, and on
  smaller phones the top bar keeps Menu, Help and View site on one row.

## [2.1.0] - 2026-11-20

### Added

- **A guided tour** of the admin: on your first sign-in on a device it offers itself once, and **Help → Take the tour**
  replays it any time. Each step points at one part of the screen and says what it’s for. Managers get their own tour,
  without your areas.
- **Help** in the top bar: take the tour, see the features, read what’s new.
- **Features**, in the menu: everything the website and the admin do, each with **See it on the site** and **Change it**. A
  manager sees the features they can change; the rest say “Managed by the owner”.

## [2.0.2] - 2026-11-20

### Changed

- Nothing you’ll see: roles and approvals are now also tested end to end against the real database rules (a manager’s
  approval, and requests they aren’t allowed), and their design is written up for the record.

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
