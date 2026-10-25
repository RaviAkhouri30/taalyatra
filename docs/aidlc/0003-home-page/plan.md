# 0003 · Home page — task plan

Source design: `design/prototype/project/Main.dc.html` (local only, git-ignored).
Each task is built, tested and checked off one at a time. Status: ☐ todo · ◐ in progress · ☑ done.

Data comes from a fake backend (`fake-db.json` served by `FakeHttpsService`) until Firebase is set
up. The factory switches to Firebase with one environment flag, and nothing else changes.

## A. Foundations the home page needs

| # | Task | Status |
| --- | --- | --- |
| 1 | Shared layer: unit specs for the layout components (from 0002) | ☑ |
| 2 | Data layer: environments + `APP_ENVIRONMENT`, `IHttpBackend` port, `FakeHttpsService` + `fake-db.json`, `RestHttpBackend`, factory, `ApiBaseService` + `HttpsErrorHandler` + `LoaderService`, `UrlConstants` | ☑ |
| 3 | Routing: lazy home route (`layout: Home`), wildcard fallback | ☑ |
| 4 | Home page container composing the sections; each section owns its service → view model → component and loads its own data (lets below-the-fold sections load lazily with `@defer`) | ☑ |

## B. Home page sections (each: interfaces, fake data, components, styles, specs)

| # | Section (design anchor) | Status |
| --- | --- | --- |
| 5 | Hero: eyebrow, title, lead, pills, CTAs, drum stage + sky (`#top`) | ☑ |
| 6 | Marquee strip + trust row | ☑ |
| 7 | Diwali offers (`#diwali`) | ☐ |
| 8 | Made for every gathering (`#for-everyone`) | ☐ |
| 9 | Experiences: filter chips + cards (`#experiences`) | ☐ |
| 10 | Shows teaser (`#shows`) | ☐ |
| 11 | Drum circle details: specs, gallery, segments (`#drum-circle-details`) | ☐ |
| 12 | Rhythm game (`#play`) | ☐ |
| 13 | Latest videos (`#watch`) | ☐ |
| 14 | Gallery + lightbox (`#gallery`) | ☐ |
| 15 | Philosophy: pillars, goals, journey (`#philosophy`) | ☐ |
| 16 | Mid-page CTA + cities | ☐ |
| 17 | How it works: steps (`#how`) | ☐ |
| 18 | Team teaser (`#team`) | ☐ |
| 19 | Instagram grid (`#insta`) | ☐ |
| 20 | Proof: stats, testimonials, clients (`#proof`) | ☐ |
| 21 | FAQ (`#faq`) | ☐ |
| 22 | Contact: proposal form (EmailJS adapter) + contact options (`#contact`) | ☐ |
| 23 | Chat assistant + floating call/WhatsApp cluster | ☐ |
| 24 | Intro loader | ☐ |

## C. Finish

| # | Task | Status |
| --- | --- | --- |
| 25 | E2E journeys + visual comparison with the prototype (desktop/tablet/mobile) | ☐ |
| 26 | Docs: AIDLC records, diagrams, CLAUDE.md updates, CHANGELOG, release `1.1.0` | ☐ |
