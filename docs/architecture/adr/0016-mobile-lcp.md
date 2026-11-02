# ADR-0016: Getting mobile LCP under the target

- **Status:** Proposed · **Date:** 2026-11-02 · **Version:** not decided

## Context

CLAUDE.md §10 sets Lighthouse Performance ≥ 95 and LCP < 2.5 s. On mobile the home page misses both.
The live site scored 89 and 3.6 s on 1.5.0, and about 81 and 3.96 s on 1.6.0 in a local comparison.
Desktop passes at 97–98. Layout shift is fixed.

**LCP accounts for nearly all of the gap.** With LCP at 2.5 s instead of about 3.8 s, the same page
would gain about 9 points (LCP is 25 % of the score) and reach about 95.

### What sets the time

Earlier records said the hero text has to wait for Firestore. That was incomplete, so I tested it.
These runs use the 1.6.0 build served locally with gzip, against live data, on simulated slow 4G with
a 4× slower CPU (Lighthouse 13.6.0). Each variant ran 5 times, in turn, on a busy machine.

| Variant                                 | Performance | LCP    | Blocking time | CLS   | LCP element   |
| --------------------------------------- | ----------- | ------ | ------------- | ----- | ------------- |
| Today                                   | 86          | 3.90 s | 158 ms        | 0     | `img.sky`     |
| Background removed                      | 86          | 3.82 s | 156 ms        | 0     | `p.lead`      |
| Background in static HTML outside Angular | 98        | 1.52 s | 165 ms        | 0     | the static image |
| Whole page as HTML, no JavaScript       | 97          | 2.12 s | 0 ms          | 0.084 | `img.sky`     |

- **The cause is the app, not one element.** The largest element is a decorative background, but
  without it the lead text lands at the same time. Nothing paints until the app has started and the
  site shell has its data (it reveals `<main>` once site config has loaded).
- **The split isn't measured.** These runs don't separate JavaScript start-up from the Firestore read.
- **Prerendering's ceiling only just clears the target:** 2.12 s, and that is with no JavaScript at
  all. A real page has to hydrate, so its blocking time returns. I estimate about 93–95, not 97.
- **Two cheaper ideas failed.** A preload of the background left LCP at 3.74 s (a separate round, 6
  runs each, baseline 3.82 s). A static copy inside `<app-root>` left it at 3.80 s, because Angular
  clears `<app-root>` on start and paints the image again.
- **Caveats:**
  - These are simulated numbers; with no throttling the live page's LCP was 1.6 s. There's no
    field data from real phones yet.
  - The 0.084 layout shift in the last row wasn't investigated. It didn't come from a real prerender.

## Options

| Option                                    | Measured or estimated       | Effect on real visitors         | Cost and risk                                               |
| ----------------------------------------- | --------------------------- | ------------------------------- | ----------------------------------------------------------- |
| **A. Measure real phones, then decide**   | —                           | None yet                        | Small: report Web Vitals; no new dependency                 |
| **B. Inline a data snapshot**             | Not measured                | Text sooner, by the data's share | Medium: stale text until the app refreshes it               |
| **C. Prerender with hydration (SSG)**     | About 93–95 (estimate)      | Everything visible sooner       | High: new dependency, code must run in Node, stale content  |
| **D. Static background outside Angular**  | 98 (measured)               | Only the background is sooner   | Small, but it passes the metric without solving the problem |
| **E. Record an exception to the target**  | —                           | None                            | None; the rule stays unmet on mobile                        |

### C conflicts with the editor

This is why prerendering isn't the obvious choice it looked like in the 0007 record.

1.6.0 lets the owner publish without a deploy. A prerendered page is frozen at build time, so after
each publish it would show old content until the app starts and replaces it. That means a visible
jump, and possibly a layout shift, which is the problem 1.5.0 fixed. It also means a visitor can
briefly see:

- an offer that has ended, or one that was switched off;
- a section the owner has hidden;
- old contact details.

The fix is to rebuild the site on every publish. That needs a backend function holding a deploy
credential, which the browser must never have. 1.7.0's signed Cloudinary uploads need a backend
function too, so the two could share one.

C also needs `@angular/ssr`, all the app's start-up code to work in Node, and a check that strict CSP
(`autoCsp`) still works with prerendered pages.

### D is rejected

It scored highest, but the text and buttons still arrive at about 3.8 s. Only the decorative background
is faster, so it would meet the number without making the page usable sooner. It would also put a
home-page image into the HTML of every route.

## Recommendation

Do this in order, and stop as soon as the evidence answers the question:

1. **Measure real phones (A).** Report LCP from real visits, so the decision rests on actual visitors
   and not only on a simulation. If real phones are already under 2.5 s, the problem is the
   simulated test, and E is the honest outcome.
2. **Test B in a throwaway build.** It separates app start-up from the data read, and shows what a
   snapshot could gain, with no change to the repo.
3. **Choose B or C from those results, in its own ADR.** Take C only if real phones are slow and B
   isn't enough, and design it together with 1.7.0's backend function.

## Consequences if accepted

- A small piece of telemetry joins the public site. It has to stay within the performance budget and
  strict CSP, sit behind a port, and collect no personal data.
- The mobile target stays unmet until step 3. This ADR records that as a known exception.
- Nothing is built for B or C yet.
