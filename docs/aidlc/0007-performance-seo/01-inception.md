# 01 · Inception — Performance & SEO

## Problem / goal

Verification of 1.4.1 on the live site found Lighthouse Performance at **73** on mobile (LCP
3.5 s, CLS 0.339) and **86** on desktop (CLS 0.158), against a target of 95.

- Accessibility, Best Practices and SEO score 100.
- SEO is still basic: one description for every page, no canonical URL, no social preview, no
  structured data, no `robots.txt` or `sitemap.xml`.

**Goal:** meet the performance targets (CLS < 0.1, LCP < 2.5 s, Performance ≥ 95 where the
architecture allows) and give every public page complete SEO metadata, with no visual change
except where layout shifts are removed.

## Acceptance criteria

- [ ] Given a phone on slow 4G, when the home page loads, then the hero renders in one pass: the
      illustration never paints before the text.
- [ ] Given the web fonts loading late, when they swap in, then text barely moves: fallback faces
      are sized to match DM Sans and Bricolage Grotesque.
- [ ] Given the photos, when served, then they are no heavier or larger than they need to be.
- [ ] Given the app's first request for data, when it starts, then the Firestore code is already
      downloading alongside the main bundle (`modulepreload`).
- [ ] Given any public page, when indexed or shared, then it has:
  - its own description
  - a canonical URL
  - Open Graph and Twitter tags with a 1200×630 image
- [ ] Given the home page, when indexed, then `LocalBusiness` structured data comes from
      `site/config`, with no business details stored twice.
- [ ] `robots.txt` (admin disallowed) and `sitemap.xml` list the public pages.
- [ ] Lighthouse is re-measured on the live site after deploy, and the results are recorded.
- [ ] `npm run verify` and `npm run e2e` pass.

## Risks

- **Mobile LCP is bounded by the data round trip** (app → Firestore code → data). Without
  pre-rendering the home page at build time (an ADR-level change), 95 on mobile may not be
  reachable; the result is recorded either way.
- **The site URL is still the Azure address.** `taalyatra.in` isn't pointed at the site yet, so
  canonical URLs and the sitemap use `environment.siteUrl`, which switches when the domain goes
  live.

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-29 (in chat: "go ahead with your
recommendations, and improve the SEO, best practices and performance")
