# 04 · Verification — Media (1.7.0) (2026-11-05)

Local checks ran on `d496137`; `main` at `109f979`, the merge of PR #24, has the same files.

| Check                                                       | Result                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                            | ✔ format, lint (0 warnings), typecheck, coverage, function tests, production build                         |
| Unit tests                                                  | ✔ 1,145 site tests; 52 function tests                                                                      |
| Coverage (stmts / branches / funcs / lines)                 | ✔ site 99.72 % / 97.92 % / 99.49 % / 99.87 %; function 100 %                                               |
| Build                                                       | ✔ initial 498.44 kB raw, 115.87 kB transfer (1.6.0: 491.15 kB, 114.14 kB)                                  |
| `npm run e2e`                                               | ✔ 354 of 354 on desktop, tablet and mobile, in one clean run; axe 0 violations                             |
| `npm run test:rules`                                        | ✔ 120 of 120                                                                                               |
| `npm run e2e:firebase`                                      | ✔ 24 of 24, including the real upload adapter in a browser, with stand-ins for Cloudinary and the function |
| `npm audit`                                                 | ✔ 0 in production dependencies, site and function; see the note below on dev tools                         |
| Sonar quality gate                                          | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                                                        |
| Public pages                                                | ✔ no upload or editor code in the files the home page loads                                                |
| Live build                                                  | ✔ the live site serves `main-LAQECFN6.js`, the same file the local build produces                          |
| Live rules                                                  | ✔ deployed 2026-11-04; the active ruleset is identical to `firestore.rules`                                |
| Live function                                               | ✔ refuses a request with no token (401); signs real uploads for the admin                                  |
| Lighthouse, live home page, mobile (perf / a11y / bp / seo) | ❌ **85–89** / ✔ 100 / ✔ 100 / ✔ 100. LCP ❌ 3.59–3.81 s, CLS ✔ 0, TBT 124–211 ms (3 runs)                 |
| Lighthouse, live home page, desktop                         | ✔ 98 / ✔ 100 / ✔ 100 / ✔ 100. LCP ✔ 1.11–1.16 s, CLS ✔ 0, TBT 0 ms (3 runs)                                |

**Mobile performance is still below target,** as in 1.5.0 and 1.6.0, for the reason in
[ADR-0016](../../architecture/adr/0016-mobile-lcp.md). The scores are no worse than 1.5.0's 89 and 3.6 s. Reports from
real phones are the approved next step.

## Acceptance criteria

| Criterion (from the [inception](01-inception.md))                         | Result                                                                                                                                                                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A phone photo with GPS has no location once stored or delivered           | ✔ The owner uploaded a photo they confirm had a location, on the real account. Both stored files have no EXIF data. `prove:cloudinary` passed all 15 checks, including delivered images. **Gap:** see below. |
| A 15 MB phone photo goes through, stored at most 2400 px wide             | ◐ The owner's phone photos are stored at 2400 px wide. A file of that exact size wasn't tried.                                                                                                               |
| An image with no description blocks publishing                            | ✔ Browser test                                                                                                                                                                                               |
| A crop shows on the site, and the same image keeps its own crop elsewhere | ◐ Stored per use and tested; the owner's live crop isn't confirmed yet.                                                                                                                                      |
| An image in use can't be deleted, and the editor says where               | ✔ Browser test; the live library shows "Used in"                                                                                                                                                             |
| A collection publishes and undoes together                                | ✔ Browser test, and through the real rules on the emulator                                                                                                                                                   |
| Any account but the admin is refused by the function                      | ✔ Function tests; live request with no token refused                                                                                                                                                         |
| Public pages download no editor or upload code                            | ✔ Checked in the production build                                                                                                                                                                            |

## Known gaps

- **HEIC that the browser can't read.** A photo that goes to Cloudinary without the browser redrawing it relies only on
  `fl_force_strip`. That was proven with a HEIC made on a Mac, not one from an iPhone.
- **The real-account photos went through the browser's redraw,** which also removes metadata. So the live result shows the
  whole path is clean, and doesn't separately prove Cloudinary's step; `prove:cloudinary` does that.
- **`npm audit`** lists vulnerabilities in dev tools only, none in what ships. They were not changed in this release.
- **Sonar** has not run on this release, as on the ones before it.

## Bugs found by the owner's live test

- **Every real upload failed at first:** Angular's default transport refuses a request asking for upload progress. No test ran
  the real adapter in a browser, so the Firebase suite now does (PR #19).
- **The pipeline failed on PR #21:** I hadn't run the rules tests for that change, so nothing deployed until PR #22.
- **A change made during a running save could be lost** (present since 1.6.0). Fixed before release.

---

**Approval:** ☐ Pending
